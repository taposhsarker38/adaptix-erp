import uuid
from django.db import models
from django.utils import timezone
from apps.employees.models import Employee

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('leave', 'On Leave'),
    )

    METHOD_CHOICES = (
        ('manual', 'Manual'),
        ('biometric', 'Biometric Device'),
        ('app', 'Mobile App'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField(default=timezone.now)
    
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    
    # New Fields for Advanced Attendance
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='manual')
    device_id = models.CharField(max_length=100, blank=True, null=True, help_text="Biometric Device Serial / App Device ID")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_data = models.JSONField(default=dict, blank=True, help_text="Raw metadata from device")

    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee} - {self.date} ({self.status})"
