from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryOptimizationViewSet

router = DefaultRouter()
router.register(r'opt', InventoryOptimizationViewSet, basename='inventory-opt')

urlpatterns = [
    path('', include(router.urls)),
]
