from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AutomationRule, ActionLog, Workflow, WorkflowInstance
from .serializers import (
    AutomationRuleSerializer, ActionLogSerializer, 
    WorkflowSerializer, WorkflowInstanceSerializer
)
from .services import RuleEngine

class AutomationRuleViewSet(viewsets.ModelViewSet):
    serializer_class = AutomationRuleSerializer

    def get_queryset(self):
        company_uuid = getattr(self.request, 'company_uuid', None)
        return AutomationRule.objects.filter(company_uuid=company_uuid, is_deleted=False)

    def perform_create(self, serializer):
        company_uuid = getattr(self.request, 'company_uuid', None)
        serializer.save(company_uuid=company_uuid)

class ActionLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActionLogSerializer
    def get_queryset(self):
        company_uuid = getattr(self.request, 'company_uuid', None)
        return ActionLog.objects.filter(rule__company_uuid=company_uuid).order_by('-executed_at')

class WorkflowViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowSerializer
    def get_queryset(self):
        company_uuid = getattr(self.request, 'company_uuid', None)
        return Workflow.objects.filter(company_uuid=company_uuid, is_deleted=False)
    
    def perform_create(self, serializer):
        company_uuid = getattr(self.request, 'company_uuid', None)
        serializer.save(company_uuid=company_uuid)

class WorkflowInstanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WorkflowInstanceSerializer
    def get_queryset(self):
        company_uuid = getattr(self.request, 'company_uuid', None)
        return WorkflowInstance.objects.filter(company_uuid=company_uuid).order_by('-started_at')

class TriggerAutomationView(APIView):
    def post(self, request):
        trigger_type = request.data.get('trigger_type')
        context = request.data.get('context', {})
        
        if not trigger_type:
            return Response({"error": "trigger_type is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        results = RuleEngine.evaluate(trigger_type, context)
        
        return Response({
            "message": "Automation rules evaluated",
            "results": results
        })
