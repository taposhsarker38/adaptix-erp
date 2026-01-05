from rest_framework import serializers
from .models import Camera

class CameraSerializer(serializers.ModelSerializer):
    environment_type_display = serializers.CharField(source='get_environment_type_display', read_only=True)

    class Meta:
        model = Camera
        fields = [
            'id', 'uuid', 'name', 'branch_uuid', 
            'environment_type', 'environment_type_display',
            'ip_address', 'location_description', 
            'is_active', 'created_at'
        ]
        read_only_fields = ['uuid', 'created_at']
