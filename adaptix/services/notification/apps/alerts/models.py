import uuid
from django.db import models
from django.utils import timezone

class Notification(models.Model):
    TYPE_CHOICES = (
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Target User
    user_id = models.UUIDField(db_index=True)
    company_uuid = models.UUIDField(db_index=True, null=True, blank=True)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    
    # Metadata for linking (e.g., link to Order #123)
    data = models.JSONField(default=dict, blank=True)
    link = models.CharField(max_length=500, blank=True, null=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.user_id})"
