from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveTypeViewSet, LeaveAllocationViewSet, LeaveApplicationViewSet

router = DefaultRouter()
router.register(r'types', LeaveTypeViewSet)
router.register(r'allocations', LeaveAllocationViewSet)
router.register(r'applications', LeaveApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
