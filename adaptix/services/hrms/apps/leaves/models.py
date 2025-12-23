import uuid
from django.db import models
from django.utils import timezone
from apps.employees.models import Employee

class LeaveType(models.Model):
    """
    Defines types of leaves: Annual, Sick, Casual, Unpaid.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    name = models.CharField(max_length=100) # e.g. "Annual Leave"
    code = models.CharField(max_length=20)   # e.g. "AL"
    
    is_paid = models.BooleanField(default=True)
    is_carry_forward = models.BooleanField(default=False)
    days_allowed_per_year = models.PositiveIntegerField(default=0)
    
    # New fields for dynamic rules
    gender_exclusive = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female')], null=True, blank=True)
    minimum_tenure_days = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('company_uuid', 'code')

    def __str__(self):
        return self.name

class LeaveAllocation(models.Model):
    """
    Tracks leave balance for an employee for a specific year.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_allocations')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    
    year = models.PositiveIntegerField(default=timezone.now().year)
    total_allocated = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    used = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    
    status = models.CharField(max_length=20, choices=[('DRAFT', 'Draft'), ('APPROVED', 'Approved')], default='DRAFT')
    notes = models.TextField(blank=True)
    
    # helper property
    @property
    def remaining(self):
        return self.total_allocated - self.used

    class Meta:
        unique_together = ('employee', 'leave_type', 'year')

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.year})"

class LeaveApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_applications')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def duration(self):
        return (self.end_date - self.start_date).days + 1

    def __str__(self):
        return f"{self.employee} : {self.start_date} -> {self.end_date} ({self.status})"

class LeavePolicy(models.Model):
    """
    Template for dynamic leave allocation rules.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    name = models.CharField(max_length=100)
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    
    allocation_days = models.DecimalField(max_digits=5, decimal_places=1)
    tenure_months_required = models.PositiveIntegerField(default=0)
    gender_requirement = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('ALL', 'All')], default='ALL')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.leave_type.name})"
