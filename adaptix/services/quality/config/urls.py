from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/quality/', include('apps.quality.urls')),
    
    # OpenAPI
    path('api/quality/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/quality/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
