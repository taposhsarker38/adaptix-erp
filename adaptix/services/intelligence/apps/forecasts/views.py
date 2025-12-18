from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SalesForecast
from .serializers import SalesForecastSerializer
from .tasks import generate_sales_forecast
import pandas as pd
from prophet import Prophet
from datetime import datetime
from django.db import connection

class SalesForecastViewSet(viewsets.ModelViewSet):
    serializer_class = SalesForecastSerializer

    def get_queryset(self):
        company_uuid = self.request.user_claims.get('company_uuid')
        queryset = SalesForecast.objects.filter(company_uuid=company_uuid)
        if product_uuid := self.request.query_params.get('product_uuid'):
            queryset = queryset.filter(product_uuid=product_uuid)
        return queryset

    @action(detail=False, methods=['post'])
    def trigger_forecast(self, request):
        company_uuid = request.user_claims.get('company_uuid')
        product_uuid = request.data.get('product_uuid')
        
        # Delay the task to Celery
        generate_sales_forecast.delay(company_uuid=company_uuid, product_uuid=product_uuid)
        
        return Response({
            "status": "Accepted", 
            "message": "Forecasting task has been queued."
        }, status=status.HTTP_202_ACCEPTED)

# The original SalesForecastView class can be removed or kept for legacy, 
# but we prefer the ViewSet approach now.
