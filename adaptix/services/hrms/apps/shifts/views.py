from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shift, EmployeeShift
from .serializers import ShiftSerializer, EmployeeShiftSerializer
from config.base_views import BaseCompanyViewSet

class ShiftViewSet(BaseCompanyViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    required_permission = 'hrms.shift'

class EmployeeShiftViewSet(BaseCompanyViewSet):
    queryset = EmployeeShift.objects.all()
    serializer_class = EmployeeShiftSerializer
    required_permission = 'hrms.roster'

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """
        Assign shift to multiple employees.
        Payload: {
            "employee_ids": ["uuid1", "uuid2"],
            "shift_id": "uuid",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD" (optional),
            "company_uuid": "uuid"
        }
        """
        employee_ids = request.data.get('employee_ids', [])
        shift_id = request.data.get('shift_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        company_uuid = request.data.get('company_uuid')
        assigned_by = request.data.get('assigned_by') # Should verify from user token

        if not employee_ids or not shift_id or not start_date or not company_uuid:
            return Response({"error": "Missing Required Fields"}, status=status.HTTP_400_BAD_REQUEST)

        shifts = []
        for emp_id in employee_ids:
            shifts.append(EmployeeShift(
                company_uuid=company_uuid,
                employee_id=emp_id,
                shift_id=shift_id,
                start_date=start_date,
                end_date=end_date,
                assigned_by=assigned_by
            ))
        
        EmployeeShift.objects.bulk_create(shifts)
        
        # Trigger Notification
        from utils.messaging import publish_event
        payload = {
            "type": "shift_assigned",
            "company_uuid": company_uuid,
            "employee_ids": employee_ids,
            "shift_id": shift_id,
           "start_date": start_date
        }
        publish_event(exchange="events", routing_key="hrms.shift.assigned", payload=payload)
        
        return Response({"message": f"Assigned shift to {len(shifts)} employees"}, status=status.HTTP_201_CREATED)
