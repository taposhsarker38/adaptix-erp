import os
import django
import uuid
from django.utils import timezone
from datetime import timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.leaves.models import LeaveType, LeavePolicy, LeaveAllocation
from apps.employees.models import Employee, Department, Designation
from apps.leaves.services import EntitlementEngine

def verify_leave_flow():
    company_uuid = uuid.uuid4()
    print(f"Starting verification for Company: {company_uuid}")

    # 1. Setup Base Data
    dept = Department.objects.create(company_uuid=company_uuid, name="Engineering")
    desig = Designation.objects.create(company_uuid=company_uuid, name="Senior Engineer")
    
    # Employee 1: Joined 2 years ago (Should get all leaves)
    emp1 = Employee.objects.create(
        company_uuid=company_uuid,
        first_name="Taposh",
        last_name="Sarker",
        email=f"taposh_{uuid.uuid4().hex[:4]}@example.com",
        department=dept,
        designation=desig,
        joining_date=timezone.now().date() - timedelta(days=730),
        gender='MALE'
    )
    
    # Employee 2: Joined yesterday (Should NOT get leaves with 6-month tenure req)
    emp2 = Employee.objects.create(
        company_uuid=company_uuid,
        first_name="New",
        last_name="Joiner",
        email=f"new_{uuid.uuid4().hex[:4]}@example.com",
        department=dept,
        designation=desig,
        joining_date=timezone.now().date() - timedelta(days=1),
        gender='FEMALE'
    )

    # 2. Setup Leave Types & Policies
    casual_type = LeaveType.objects.create(company_uuid=company_uuid, name="Casual Leave", code="CL", days_allowed_per_year=12)
    maternity_type = LeaveType.objects.create(company_uuid=company_uuid, name="Maternity Leave", code="ML", days_allowed_per_year=90, gender_exclusive='FEMALE')

    # Casual Leave Policy: 12 days, no tenure req
    LeavePolicy.objects.create(
        company_uuid=company_uuid,
        name="Standard Casual Leave",
        leave_type=casual_type,
        allocation_days=12,
        tenure_months_required=0
    )

    # Annual Leave Policy: 15 days, 6 months tenure req
    annual_type = LeaveType.objects.create(company_uuid=company_uuid, name="Annual Leave", code="AL", days_allowed_per_year=15)
    LeavePolicy.objects.create(
        company_uuid=company_uuid,
        name="Standard Annual Leave",
        leave_type=annual_type,
        allocation_days=15,
        tenure_months_required=6
    )

    # 3. Run Entitlement Engine
    print("Running Entitlement Engine...")
    created_count = EntitlementEngine.run_entitlement_for_company(company_uuid)
    print(f"Allocations created: {created_count}")

    # 4. Verify Allocations
    # emp1 should have CL and AL
    # emp2 should only have CL
    emp1_allocations = LeaveAllocation.objects.filter(employee=emp1)
    print(f"Emp1 Allocations: {[a.leave_type.code for a in emp1_allocations]}")
    
    emp2_allocations = LeaveAllocation.objects.filter(employee=emp2)
    print(f"Emp2 Allocations: {[a.leave_type.code for a in emp2_allocations]}")

    errors = []
    if not emp1_allocations.filter(leave_type=casual_type).exists(): errors.append("Emp1 missing CL")
    if not emp1_allocations.filter(leave_type=annual_type).exists(): errors.append("Emp1 missing AL")
    if not emp2_allocations.filter(leave_type=casual_type).exists(): errors.append("Emp2 missing CL")
    if emp2_allocations.filter(leave_type=annual_type).exists(): errors.append("Emp2 should NOT have AL")

    # 5. Verify Draft Status
    if emp1_allocations.first().status != 'DRAFT':
        errors.append("Allocation status should be DRAFT")

    # 6. Test Bulk Approval
    print("Testing Bulk Approval...")
    draft_ids = list(emp1_allocations.values_list('id', flat=True))
    updated = LeaveAllocation.objects.filter(id__in=draft_ids).update(status='APPROVED')
    print(f"Approved {updated} allocations.")

    if LeaveAllocation.objects.get(id=draft_ids[0]).status != 'APPROVED':
        errors.append("Bulk approval failed")

    if errors:
        print("VERIFICATION FAILED:")
        for e in errors: print(f" - {e}")
    else:
        print("VERIFICATION SUCCESSFUL")

if __name__ == "__main__":
    verify_leave_flow()
