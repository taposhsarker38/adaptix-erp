from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SalaryComponentViewSet, 
    SalaryStructureViewSet, 
    EmployeeSalaryViewSet, 
    PayslipViewSet
)

router = DefaultRouter()
router.register(r'components', SalaryComponentViewSet)
router.register(r'structures', SalaryStructureViewSet)
router.register(r'assignments', EmployeeSalaryViewSet)
router.register(r'payslips', PayslipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
