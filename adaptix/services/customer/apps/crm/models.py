import uuid
from django.db import models
from apps.profiles.models import Customer

class Stage(models.Model):
    """
    Kanban Stages: 'New', 'Qualifying', 'Negotiation', 'Won'.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    is_won = models.BooleanField(default=False)
    is_lost = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Lead(models.Model):
    """
    Potential customer.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    source = models.CharField(max_length=100, blank=True) # Website, Referral
    
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, related_name='leads')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Opportunity(models.Model):
    """
    A deal in progress. Linked to a Customer (converted Lead).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255) # e.g. "Bulk Order Dec"
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='opportunities')
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, related_name='opportunities')
    
    expected_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    probability = models.PositiveIntegerField(default=50, help_text="% chance of closing")
    
    expected_close_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.expected_amount}"
