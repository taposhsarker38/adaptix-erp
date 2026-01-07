from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Forecast, SalesHistory
from .serializers import ForecastSerializer, SalesHistorySerializer
from .tasks import run_forecasts

class ForecastViewSet(viewsets.ModelViewSet):
    serializer_class = ForecastSerializer
    
    def get_queryset(self):
        company_uuid = getattr(self.request, 'company_uuid', None)
        queryset = Forecast.objects.filter(company_uuid=company_uuid)
        if product_uuid := self.request.query_params.get('product_uuid'):
            queryset = queryset.filter(product_uuid=product_uuid)
        return queryset

    @action(detail=False, methods=['post'])
    def trigger(self, request):
        company_uuid = getattr(request, 'company_uuid', None)
        # Import inside to avoid circular deps if any
        from .tasks import sync_sales_history, run_forecasts
        # Chain them: sync then run
        chain = sync_sales_history.s(company_uuid=company_uuid) | run_forecasts.si(company_uuid=company_uuid)
        chain.apply_async()
        return Response({"status": "AI Training started in background"}, status=status.HTTP_202_ACCEPTED)

class SalesHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SalesHistorySerializer

    def get_queryset(self):
        company_uuid = getattr(self.request, 'company_uuid', None)
        return SalesHistory.objects.filter(company_uuid=company_uuid)
