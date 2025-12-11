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
        
        # TODO: Trigger Accounting Journal Entry via Messaging
        
        return Response(self.get_serializer(payslip).data)
