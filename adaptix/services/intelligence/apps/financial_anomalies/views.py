from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import FinancialAnomaly
from rest_framework import serializers

class FinancialAnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialAnomaly
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'company_uuid']

class FinancialAnomalyViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialAnomalySerializer
    filter_backends = [filters.SearchFilter]
    # Keep filterset_fields for documentation/future, but it might only work with DjangoFilterBackend
    # For now, priority is fixing the crash and enabling search.
    search_fields = ['journal_reference', 'category', 'reasoning']

    def get_queryset(self):
        # Multi-tenant filtering via JWT claims
        claims = getattr(self.request, 'user_claims', {})
        if not claims or 'company_uuid' not in claims:
            return FinancialAnomaly.objects.none()
        return FinancialAnomaly.objects.filter(company_uuid=claims['company_uuid'])

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        anomaly = self.get_object()
        note = request.data.get('note', '')
        
        claims = getattr(request, 'user_claims', {})
        user_id = claims.get('user_id') or claims.get('sub')
        
        anomaly.is_resolved = True
        anomaly.resolution_note = note
        anomaly.resolved_at = timezone.now()
        anomaly.resolved_by = user_id
        anomaly.save()
        
        return Response({'status': 'resolved'})
        
    @action(detail=True, methods=['post'])
    def mark_as_fraud(self, request, pk=None):
        anomaly = self.get_object()
        anomaly.is_fraud = True
        anomaly.save()
        return Response({'status': 'marked_as_fraud'})

    @action(detail=True, methods=['post'])
    def unmark_as_fraud(self, request, pk=None):
        claims = getattr(request, 'user_claims', {})
        if not claims.get('is_superuser'):
            return Response({'error': 'Only superusers can unmark fraud'}, status=status.HTTP_403_FORBIDDEN)
            
        anomaly = self.get_object()
        anomaly.is_fraud = False
        anomaly.save()
        return Response({'status': 'unmarked_as_fraud'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.get_queryset().filter(is_resolved=False)
        return Response({
            'total_pending': queryset.count(),
            'high_risk': queryset.filter(severity__in=['high', 'critical']).count(),
            'recent_anomalies': FinancialAnomalySerializer(queryset[:5], many=True).data
        })
