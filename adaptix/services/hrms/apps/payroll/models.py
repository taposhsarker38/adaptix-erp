import uuid
from django.db import models
from django.utils import timezone
from apps.employees.models import Employee

class SalaryComponent(models.Model):
    """
    Defines heads: 'Basic', 'HRA', 'PF', 'Tax'.
    """
    COMPONENT_TYPES = (
        ('earning', 'Earning'),
        ('deduction', 'Deduction'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=COMPONENT_TYPES)
    is_taxable = models.BooleanField(default=True)
    
    # Configuration for auto-calculation (e.g., % of Basic) - simplified for now
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('company_uuid', 'name')

    def __str__(self):
        return f"{self.name} ({self.type})"

class SalaryStructure(models.Model):
    """
    Group of components: 'Grade A', 'Interns'.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    name = models.CharField(max_length=100)
    components = models.ManyToManyField(SalaryComponent, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class EmployeeSalary(models.Model):
    """
    Assigns a structure and specific values to an employee.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary_config')
    structure = models.ForeignKey(SalaryStructure, on_delete=models.PROTECT)
    
    # We might store specific overrides here or in a separate EAV table if complex.
    # For now, we assume the structure defines the rules, and this just links them.
    # But often Base salary varies.
    base_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Base for calculations (e.g. CTC or Basic)")
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee} - {self.base_amount}"

class Payslip(models.Model):
    """
    The monthly generated salary record.
    """
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('finalized', 'Finalized'),
        ('paid', 'Paid'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_uuid = models.UUIDField(db_index=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payslips')
    
    start_date = models.DateField()
    end_date = models.DateField()
    
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Metadata for processing
    present_days = models.FloatField(default=0)
    absent_days = models.FloatField(default=0)
    unpaid_leave_days = models.FloatField(default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'start_date')

    def __str__(self):
        return f"Payslip: {self.employee} ({self.start_date.strftime('%b %Y')})"

class PayslipLineItem(models.Model):
    """
    Individual lines: 'Basic: 5000', 'Tax: 200'.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payslip = models.ForeignKey(Payslip, on_delete=models.CASCADE, related_name='lines')
    component = models.ForeignKey(SalaryComponent, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    def __str__(self):
        return f"{self.component.name}: {self.amount}"
