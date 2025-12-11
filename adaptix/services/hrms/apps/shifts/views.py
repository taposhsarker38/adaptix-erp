from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Shift, EmployeeShift
from .serializers import ShiftSerializer, EmployeeShiftSerializer

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

    def get_queryset(self):
        # Filter by company if provided in query params (or from auth context in real usage)
        queryset = super().get_queryset()
        company_uuid = self.request.query_params.get('company_uuid')
        if company_uuid:
            queryset = queryset.filter(company_uuid=company_uuid)
        return queryset

class EmployeeShiftViewSet(viewsets.ModelViewSet):
    queryset = EmployeeShift.objects.all()
    serializer_class = EmployeeShiftSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        company_uuid = self.request.query_params.get('company_uuid')
        if company_uuid:
            queryset = queryset.filter(company_uuid=company_uuid)
            
        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
            
        return queryset

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
