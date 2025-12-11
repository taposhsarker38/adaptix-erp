from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_device import DeviceSyncView
from .views import AttendanceViewSet

router = DefaultRouter()
router.register(r'', AttendanceViewSet)

urlpatterns = [
    path('sync/', DeviceSyncView.as_view(), name='device-sync'),
    path('', include(router.urls)),
]
