from django.urls import path
from .views import CCTVEventReceiver, PresenceAnalytics, VisualCartSync, VisionStatsView, FootfallAnalyticsView, ManualVisionEntry, MovementTrackingView

urlpatterns = [
    path('receive/', CCTVEventReceiver.as_view(), name='cctv_event_receiver'),
    path('presence-analytics/', PresenceAnalytics.as_view(), name='presence_analytics'),
    path('cart-sync/', VisualCartSync.as_view(), name='visual_cart_sync'),
    path('stats/', VisionStatsView.as_view(), name='vision_stats'),
    path('traffic/', FootfallAnalyticsView.as_view(), name='footfall_analytics'),
    path('manual-entry/', ManualVisionEntry.as_view(), name='manual_vision_entry'),
    path('movement-tracking/', MovementTrackingView.as_view(), name='movement_tracking'),
]
