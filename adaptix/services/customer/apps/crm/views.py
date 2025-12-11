from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Stage, Lead, Opportunity
from .serializers import StageSerializer, LeadSerializer, OpportunitySerializer

class StageViewSet(viewsets.ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        lead = self.get_object()
        # Logic to convert Lead -> Customer -> Opportunity
        # For now, just mark conversion (User would manually link or we automate)
        return Response({'message': 'Conversion logic pending implementation'})

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        stages = Stage.objects.all().prefetch_related('opportunities')
        data = {}
        for stage in stages:
            data[stage.name] = OpportunitySerializer(stage.opportunities.all(), many=True).data
        return Response(data)
