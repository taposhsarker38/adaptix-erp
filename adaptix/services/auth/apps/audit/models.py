from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user_id = models.CharField(max_length=255, null=True, blank=True)
    username = models.CharField(max_length=255, null=True, blank=True)
    company_uuid = models.CharField(max_length=255, null=True, blank=True)
    service_name = models.CharField(max_length=100, default='unknown')
    path = models.CharField(max_length=400)
    method = models.CharField(max_length=10)
    status_code = models.PositiveSmallIntegerField()
    request_body = models.TextField(blank=True)
    payload_preview = models.JSONField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ip = models.CharField(max_length=64, blank=True, null=True)
    user_agent = models.CharField(max_length=512, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.service_name}] {self.method} {self.path} - {self.status_code}"
