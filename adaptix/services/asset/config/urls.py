from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/asset/docs/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/asset/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    path('api/asset/', include('apps.assets.urls')),
]
