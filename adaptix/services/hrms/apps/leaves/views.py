from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LeaveType, LeaveAllocation, LeaveApplication, LeavePolicy
from .serializers import (
    LeaveTypeSerializer, LeaveAllocationSerializer, 
    LeaveApplicationSerializer, LeavePolicySerializer
)
from .services import EntitlementEngine

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

class LeaveAllocationViewSet(viewsets.ModelViewSet):
    queryset = LeaveAllocation.objects.all()
    serializer_class = LeaveAllocationSerializer

    @action(detail=False, methods=['post'], url_path='run-entitlement')
    def run_entitlement(self, request):
        company_uuid = request.data.get('company_uuid')
        if not company_uuid:
            return Response({"error": "company_uuid is required"}, status=400)
        
        count = EntitlementEngine.run_entitlement_for_company(company_uuid)
        return Response({"status": "success", "allocations_created": count})
    
    @action(detail=False, methods=['post'], url_path='bulk-approve')
    def bulk_approve(self, request):
        allocation_ids = request.data.get('allocation_ids', [])
        updated = LeaveAllocation.objects.filter(id__in=allocation_ids, status='DRAFT').update(status='APPROVED')
        return Response({"status": "success", "approved_count": updated})

class LeavePolicyViewSet(viewsets.ModelViewSet):
    queryset = LeavePolicy.objects.all()
    serializer_class = LeavePolicySerializer

class LeaveApplicationViewSet(viewsets.ModelViewSet):
    queryset = LeaveApplication.objects.all()
    serializer_class = LeaveApplicationSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        application = self.get_object()
        # Logic: Check balance, deduct, etc.
        application.status = 'approved'
        application.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'rejected'
        application.save()
        return Response({'status': 'rejected'})
