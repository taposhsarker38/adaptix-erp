from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoyaltyAccountViewSet

router = DefaultRouter()
router.register(r'accounts', LoyaltyAccountViewSet, basename='loyalty-account')

urlpatterns = [
    path('', include(router.urls)),
]
