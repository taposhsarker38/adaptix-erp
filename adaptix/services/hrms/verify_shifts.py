import os
import django
import json
import time
from uuid import uuid4
from datetime import date

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.employees.models import Employee, Department, Designation
from apps.shifts.models import Shift, EmployeeShift
from rest_framework.test import APIRequestFactory
from apps.shifts.views import EmployeeShiftViewSet

def run_test():
    company_uuid = str(uuid4())
    
    # 1. Create Department & Designation
    dept = Department.objects.create(company_uuid=company_uuid, name="Engineering")
    desig = Designation.objects.create(company_uuid=company_uuid, name="Developer")
    print(f"✅ Created Dept: {dept.name}, Desig: {desig.name}")

    # 2. Create Employee
    emp = Employee.objects.create(
        company_uuid=company_uuid,
        first_name="John",
        last_name="Doe",
        email=f"john.{uuid4()}@example.com",
        department=dept,
        designation=desig
    )
    print(f"✅ Created Employee: {emp}")

    # 3. Create Shift
    shift = Shift.objects.create(
        company_uuid=company_uuid,
        name="Morning Shift",
        code="MORNING",
        start_time="09:00",
        end_time="17:00"
    )
    print(f"✅ Created Shift: {shift}")

    # 4. Assign Shift (Trigger Notification)
    factory = APIRequestFactory()
    view = EmployeeShiftViewSet.as_view({'post': 'bulk_assign'})
    
    payload = {
        "company_uuid": company_uuid,
        "employee_ids": [str(emp.id)],
        "shift_id": str(shift.id),
        "start_date": str(date.today()),
        "assigned_by": str(uuid4())
    }
    
    request = factory.post('/api/hrms/shifts/roster/bulk_assign/', payload, format='json')
    response = view(request)
    
    if response.status_code == 201:
        print(f"✅ Shift Assigned Successfully: {response.data}")
    else:
        print(f"❌ Failed to Assign Shift: {response.data}")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
