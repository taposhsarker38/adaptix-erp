from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AutomationRuleViewSet, ActionLogViewSet, 
    WorkflowViewSet, WorkflowInstanceViewSet,
    TriggerAutomationView
)

router = DefaultRouter()
router.register(r'rules', AutomationRuleViewSet, basename='automationrule')
router.register(r'logs', ActionLogViewSet, basename='actionlog')
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'instances', WorkflowInstanceViewSet, basename='workflowinstance')

urlpatterns = [
    path('', include(router.urls)),
    path('trigger/', TriggerAutomationView.as_view(), name='trigger-automation'),
]
