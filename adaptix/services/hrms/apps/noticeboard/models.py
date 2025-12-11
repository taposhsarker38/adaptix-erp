from django.db import models
import uuid

class Notice(models.Model):
    AUDIENCE_CHOICES = (
        ('all', 'All Employees'),
        ('department', 'Specific Department'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    attachment = models.FileField(upload_to='notices/', blank=True, null=True)
    
    is_published = models.BooleanField(default=True)
    
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    target_department = models.CharField(max_length=100, blank=True, null=True, help_text="Exact name of the department if targeting specific department")
    
    created_by = models.UUIDField(help_text="User UUID of the creator")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
