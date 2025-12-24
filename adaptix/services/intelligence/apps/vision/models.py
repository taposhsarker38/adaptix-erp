from django.db import models
import uuid

class Camera(models.Model):
    ENVIRONMENT_CHOICES = [
        ('RETAIL', 'Retail Store'),
        ('FACTORY', 'Factory Floor'),
        ('OFFICE', 'Head Office'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=255)
    branch_uuid = models.UUIDField(db_index=True)
    environment_type = models.CharField(max_length=10, choices=ENVIRONMENT_CHOICES, default='RETAIL')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    location_description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_environment_type_display()})"

class FootfallStats(models.Model):
    """Retail-focused stats."""
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, related_name='footfall_stats')
    timestamp = models.DateTimeField(db_index=True)
    entries = models.IntegerField(default=0)
    exits = models.IntegerField(default=0)
    source = models.CharField(max_length=10, choices=[('AI', 'AI Vision'), ('MANUAL', 'Manual Entry')], default='AI')
    
    class Meta:
        verbose_name_plural = "Footfall stats"
        unique_together = ('camera', 'timestamp')

class PresenceLog(models.Model):
    """Employee/Visitor focus for Factory/Office."""
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, related_name='presence_logs')
    person_id = models.CharField(max_length=255, db_index=True) # Employee UUID or Anonymous ID
    person_type = models.CharField(max_length=20, choices=[
        ('EMPLOYEE', 'Employee'), 
        ('VISITOR', 'Visitor'), 
        ('CUSTOMER', 'Customer'),
        ('UNAUTHORIZED', 'Unauthorized')
    ], default='VISITOR')
    direction = models.CharField(max_length=10, choices=[('IN', 'Entry'), ('OUT', 'Exit')], default='IN')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    source = models.CharField(max_length=10, choices=[('AI', 'AI Vision'), ('MANUAL', 'Manual Entry')], default='AI')
    metadata = models.JSONField(default=dict, blank=True) # Confidence scores, etc.

class VisualCart(models.Model):
    """Draft invoice data from visual recognition."""
    session_id = models.CharField(max_length=255, db_index=True)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True)
    pos_terminal_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    detected_items = models.JSONField(default=list) # List of product_uuids or names
    is_converted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
