from rest_framework import serializers
from .models import AssetCategory, Asset, DepreciationSchedule

class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetCategory
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ['current_value']

class DepreciationScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepreciationSchedule
        fields = '__all__'
