from rest_framework import serializers
from .models import LeaveType, LeaveAllocation, LeaveApplication, LeavePolicy

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveAllocationSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    
    class Meta:
        model = LeaveAllocation
        fields = '__all__'

class LeaveApplicationSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)
    
    class Meta:
        model = LeaveApplication
        fields = '__all__'
        read_only_fields = ['status', 'approved_by', 'rejection_reason']

class LeavePolicySerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    
    class Meta:
        model = LeavePolicy
        fields = '__all__'
