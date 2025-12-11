from rest_framework import serializers
from .models import SalaryComponent, SalaryStructure, EmployeeSalary, Payslip, PayslipLineItem

class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = '__all__'

class SalaryStructureSerializer(serializers.ModelSerializer):
    components = SalaryComponentSerializer(many=True, read_only=True)
    component_ids = serializers.PrimaryKeyRelatedField(
        queryset=SalaryComponent.objects.all(), source='components', write_only=True, many=True
    )

    class Meta:
        model = SalaryStructure
        fields = '__all__'

class EmployeeSalarySerializer(serializers.ModelSerializer):
    structure_details = SalaryStructureSerializer(source='structure', read_only=True)

    class Meta:
        model = EmployeeSalary
        fields = '__all__'

class PayslipLineItemSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source='component.name', read_only=True)
    
    class Meta:
        model = PayslipLineItem
        fields = ['id', 'component', 'component_name', 'amount']

class PayslipSerializer(serializers.ModelSerializer):
    lines = PayslipLineItemSerializer(many=True, read_only=True)
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'
        read_only_fields = ['net_pay', 'total_earnings', 'total_deductions', 'status']
