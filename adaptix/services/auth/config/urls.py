from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.accounts import urls as accounts_urls
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView,SpectacularRedocView
from django_prometheus.exports import ExportToDjangoView
from django.http import JsonResponse
def health_check(request):
    return JsonResponse({'status': 'healthy', 'service': 'auth'})

urlpatterns = [
    path("health/", health_check),
    path("api/auth/health/", health_check),
    path("admin/", admin.site.urls),
    path("api/auth/", include(accounts_urls)),
    path("api/auth/audit/", include("apps.audit.urls")),
    path("api/auth/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/auth/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/auth/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("metrics/", ExportToDjangoView, name="prometheus-metrics"),
]
