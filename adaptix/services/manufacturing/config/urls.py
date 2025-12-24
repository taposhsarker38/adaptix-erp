from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse
from django_prometheus.exports import ExportToDjangoView

def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'manufacturing'})

urlpatterns = [
    path('health/', health_check),
    path('api/manufacturing/health/', health_check),
    path('metrics/', ExportToDjangoView, name='prometheus-metrics'),
    
    # API Routes
    path('api/manufacturing/', include('apps.mrp.urls')),
    
    # OpenAPI Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
