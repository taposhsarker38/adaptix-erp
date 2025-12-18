"""
Adaptix Shared Utilities
========================
Common base classes and utilities for all microservices.
"""

from rest_framework import viewsets, permissions
from rest_framework.response import Response


class CompanyFilterMixin:
    """
    Mixin to automatically filter querysets by company_uuid from JWT token.
    """
    
    def get_queryset(self):
        queryset = super().get_queryset()
        company_uuid = getattr(self.request, 'company_uuid', None)
        
        if company_uuid and hasattr(queryset.model, 'company_uuid'):
            return queryset.filter(company_uuid=company_uuid)
        return queryset


class CompanyCreateMixin:
    """
    Mixin to automatically inject company_uuid on object creation.
    """
    
    def perform_create(self, serializer):
        company_uuid = getattr(self.request, 'company_uuid', None)
        claims = getattr(self.request, 'user_claims', {}) or {}
        user_id = claims.get('sub') or claims.get('user_id')
        
        # Build extra fields to save
        extra_fields = {}
        
        # Add company_uuid if model has the field
        model = serializer.Meta.model
        if hasattr(model, 'company_uuid') and company_uuid:
            extra_fields['company_uuid'] = company_uuid
        
        # Add created_by if model has the field
        if hasattr(model, 'created_by') and user_id:
            extra_fields['created_by'] = user_id
            
        serializer.save(**extra_fields)


class CompanyUpdateMixin:
    """
    Mixin to automatically inject updated_by on object update.
    """
    
    def perform_update(self, serializer):
        claims = getattr(self.request, 'user_claims', {}) or {}
        user_id = claims.get('sub') or claims.get('user_id')
        
        extra_fields = {}
        model = serializer.Meta.model
        
        if hasattr(model, 'updated_by') and user_id:
            extra_fields['updated_by'] = user_id
            
        serializer.save(**extra_fields)


from adaptix_core.permissions import HasPermission


class BaseCompanyViewSet(CompanyFilterMixin, CompanyCreateMixin, CompanyUpdateMixin, viewsets.ModelViewSet):
    """
    Base ViewSet for all company-scoped resources.
    
    Features:
    - Auto-filters queryset by company_uuid
    - Auto-injects company_uuid on create
    - Auto-injects created_by/updated_by
    - Standard permission checking
    
    Usage:
        class EmployeeViewSet(BaseCompanyViewSet):
            queryset = Employee.objects.all()
            serializer_class = EmployeeSerializer
            required_permission = 'hrms.employee'  # Optional
    """
    permission_classes = [HasPermission]
    required_permission = None  # Override in subclass if needed


class BaseReadOnlyCompanyViewSet(CompanyFilterMixin, viewsets.ReadOnlyModelViewSet):
    """
    Read-only version for reporting/analytics endpoints.
    """
    permission_classes = [HasPermission]
    required_permission = None
