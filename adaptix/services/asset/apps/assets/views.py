from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AssetCategory, Asset, DepreciationSchedule
from .serializers import AssetCategorySerializer, AssetSerializer, DepreciationScheduleSerializer

class AssetCategoryViewSet(viewsets.ModelViewSet):
    queryset = AssetCategory.objects.all()
    serializer_class = AssetCategorySerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    def perform_create(self, serializer):
        # Initial value is purchase cost
        serializer.save(current_value=serializer.validated_data['purchase_cost'])

class DepreciationScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DepreciationSchedule.objects.all()
    serializer_class = DepreciationScheduleSerializer
