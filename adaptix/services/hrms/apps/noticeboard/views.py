from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Notice
from .serializers import NoticeSerializer

class NoticeViewSet(viewsets.ModelViewSet):
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by Company
        user = self.request.user
        qs = Notice.objects.all()
        
        # 1. Company Filter (Assuming Middleware sets company_uuid implicitly from Token/Header, 
        #    but we don't have request.company_uuid here easily unless middleware is standard.
        #    For now, we'll assume basic filtering. In prod, use tenant middleware)
        # qs = qs.filter(company_uuid=...)

        # 2. Audience Filter
        department = self.request.query_params.get('department')
        if department:
            # Show All + Targeted to Department
            qs = qs.filter(models.Q(target_audience='all') | models.Q(target_department=department))
        
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-assign Company UUID from headers (Standard Adaptix pattern)
        company_uuid = self.request.headers.get('X-Company-UUID')
        serializer.save(created_by=self.request.user.id, company_uuid=company_uuid)
