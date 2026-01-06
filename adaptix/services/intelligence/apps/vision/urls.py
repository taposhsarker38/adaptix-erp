from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CCTVEventReceiver, PresenceAnalytics, VisualCartSync, 
    VisionStatsView, FootfallAnalyticsView, ManualVisionEntry, 
    MovementTrackingView, CameraViewSet,
    FaceRegistrationView, FaceSyncView
)

router = DefaultRouter()
router.register('cameras', CameraViewSet, basename='camera')

urlpatterns = [
    path('', include(router.urls)),
    path('receive/', CCTVEventReceiver.as_view(), name='cctv_event_receiver'),
    path('presence-analytics/', PresenceAnalytics.as_view(), name='presence_analytics'),
    path('cart-sync/', VisualCartSync.as_view(), name='visual_cart_sync'),
    path('stats/', VisionStatsView.as_view(), name='vision_stats'),
    path('traffic/', FootfallAnalyticsView.as_view(), name='footfall_analytics'),
    path('manual-entry/', ManualVisionEntry.as_view(), name='manual_vision_entry'),
    path('movement-tracking/', MovementTrackingView.as_view(), name='movement_tracking'),
    path('face-registration/', FaceRegistrationView.as_view(), name='face_registration'),
    path('face-sync-status/', FaceSyncView.as_view(), name='face_sync_status'),
]
