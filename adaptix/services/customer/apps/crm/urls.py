from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StageViewSet, LeadViewSet, OpportunityViewSet

router = DefaultRouter()
router.register(r'stages', StageViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'opportunities', OpportunityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
