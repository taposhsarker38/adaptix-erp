from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShiftViewSet, EmployeeShiftViewSet

router = DefaultRouter()
router.register(r'definitions', ShiftViewSet, basename='shift-definitions')
router.register(r'roster', EmployeeShiftViewSet, basename='roster')

urlpatterns = [
    path('', include(router.urls)),
]
