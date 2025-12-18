from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('shipping/', include('apps.shipping.urls')),
    
    # OpenAPI
    path('api/logistics/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/logistics/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
