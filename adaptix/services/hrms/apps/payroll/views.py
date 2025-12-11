from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SalaryComponent, SalaryStructure, EmployeeSalary, Payslip
from .serializers import (
    SalaryComponentSerializer, 
    SalaryStructureSerializer, 
    EmployeeSalarySerializer, 
    PayslipSerializer
)

class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer

class SalaryStructureViewSet(viewsets.ModelViewSet):
    queryset = SalaryStructure.objects.all()
    serializer_class = SalaryStructureSerializer

class EmployeeSalaryViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSalary.objects.all()
    serializer_class = EmployeeSalarySerializer

class PayslipViewSet(viewsets.ModelViewSet):
    queryset = Payslip.objects.all()
    serializer_class = PayslipSerializer

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        payslip = self.get_object()
        if payslip.status != 'draft':
            return Response({"error": "Only draft payslips can be finalized"}, status=status.HTTP_400_BAD_REQUEST)
        
        payslip.status = 'finalized'
        payslip.save()
        
        # Trigger Accounting Journal Entry via Messaging
        try:
            from utils.messaging import publish_event
            payload = {
                "type": "payroll_finalized",
                "payslip_id": str(payslip.id),
                "employee_id": str(payslip.employee.id),
                "company_uuid": str(payslip.company_uuid),
                "net_pay": float(payslip.net_pay),
                "period_start": str(payslip.start_date),
                "period_end": str(payslip.end_date)
            }
            publish_event(exchange="events", routing_key="hrms.payroll.finalized", payload=payload)
        except Exception as e:
            # Log error but don't fail transaction? Or fail? For now, print.
            print(f"Failed to publish payroll event: {e}")
        
        return Response(self.get_serializer(payslip).data)
