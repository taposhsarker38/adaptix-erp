from django.contrib import admin
from .models import SalaryComponent, SalaryStructure, EmployeeSalary, Payslip, PayslipLineItem

class PayslipLineItemInline(admin.TabularInline):
    model = PayslipLineItem
    extra = 0

@admin.register(SalaryComponent)
class SalaryComponentAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'is_taxable', 'company_uuid')

@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ('name', 'company_uuid')

@admin.register(EmployeeSalary)
class EmployeeSalaryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'structure', 'base_amount')

@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ('employee', 'start_date', 'net_pay', 'status')
    inlines = [PayslipLineItemInline]
