from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.tenants import urls as tenants_urls
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView,SpectacularRedocView
from django.http import JsonResponse
def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'company'})

urlpatterns = [
    path("health/", health_check),
    path("api/company/health/", health_check),
    path("admin/", admin.site.urls),
    path("api/company/", include(tenants_urls)),
    path("api/company/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/company/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/company/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
