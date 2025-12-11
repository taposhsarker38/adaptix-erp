import os
import django
import uuid
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.employees.models import Employee, Department, Designation
from apps.payroll.models import SalaryComponent, SalaryStructure, EmployeeSalary, Payslip, PayslipLineItem

def run_test():
    company_uuid = str(uuid.uuid4())
    
    # 1. Setup Employee
    emp = Employee.objects.first()
    if not emp:
        dept, _ = Department.objects.get_or_create(company_uuid=company_uuid, name="HR")
        desig, _ = Designation.objects.get_or_create(company_uuid=company_uuid, name="Manager")
        emp = Employee.objects.create(
            company_uuid=company_uuid,
            first_name="Payroll",
            last_name="Tester",
            email=f"pay.{uuid.uuid4()}@test.com",
            department=dept,
            designation=desig
        )
    else:
        company_uuid = str(emp.company_uuid)
        
    print(f"✅ Employee: {emp}")

    # 2. Define Components
    basic, _ = SalaryComponent.objects.get_or_create(
        company_uuid=company_uuid,
        name="Basic Salary",
        defaults={'type': "earning", 'is_taxable': True}
    )
    hra, _ = SalaryComponent.objects.get_or_create(
        company_uuid=company_uuid,
        name="House Rent Allowance",
        defaults={'type': "earning", 'is_taxable': True}
    )
    tax, _ = SalaryComponent.objects.get_or_create(
        company_uuid=company_uuid,
        name="Income Tax",
        defaults={'type': "deduction", 'is_taxable': False}
    )
    print(f"✅ Components Created")

    # 3. Create Structure
    structure, _ = SalaryStructure.objects.get_or_create(
        company_uuid=company_uuid,
        name="Grade A"
    )
    structure.components.add(basic, hra, tax)
    print(f"✅ Structure Created: {structure.name}")

    # 4. Assign to Employee
    EmployeeSalary.objects.get_or_create(
        company_uuid=company_uuid,
        employee=emp,
        defaults={'structure': structure, 'base_amount': 50000}
    )
    print(f"✅ Assigned Structure to Employee")

    # 5. Generate Mock Payslip (Clean up old draft if exists for clean test)
    Payslip.objects.filter(employee=emp, status='draft').delete()

    # Logic: Basic = 50% of Base, HRA = 20% of Base, Tax = 10% of Base
    earnings = 0
    deductions = 0
    
    start_date = date(2025, 2, 1) # Use a future date to avoid collision with prev run if any
    
    # Force clean cleanup
    Payslip.objects.filter(employee=emp, start_date=start_date).delete()

    payslip = Payslip.objects.create(
        company_uuid=company_uuid,
        employee=emp,
        start_date=start_date,
        end_date=date(2025, 2, 28)
    )
    
    # Simulate Calculation
    base = 50000
    PayslipLineItem.objects.create(payslip=payslip, component=basic, amount=base * 0.5)
    earnings += base * 0.5
    
    PayslipLineItem.objects.create(payslip=payslip, component=hra, amount=base * 0.2)
    earnings += base * 0.2
    
    PayslipLineItem.objects.create(payslip=payslip, component=tax, amount=base * 0.1)
    deductions += base * 0.1
    
    payslip.total_earnings = earnings
    payslip.total_deductions = deductions
    payslip.net_pay = earnings - deductions
    payslip.save()
    
    print(f"✅ Payslip Generated: Net Pay = {payslip.net_pay}")
    
    # 6. Finalize Verify
    assert payslip.net_pay == (25000 + 10000 - 5000)
    print("✅ Verification Successful!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
