from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveTypeViewSet, LeaveAllocationViewSet, LeaveApplicationViewSet, LeavePolicyViewSet

router = DefaultRouter()
router.register(r'types', LeaveTypeViewSet)
router.register(r'allocations', LeaveAllocationViewSet)
router.register(r'applications', LeaveApplicationViewSet)
router.register(r'policies', LeavePolicyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
