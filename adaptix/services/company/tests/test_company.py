import pytest
import uuid
from decimal import Decimal
from apps.tenants.models import Company, Department, Employee, CompanySetting

@pytest.mark.django_db
class TestCompanyLogic:
    def test_company_creation_and_settings(self):
        """Verify Company creation triggers default settings"""
        auth_uuid = uuid.uuid4()
        company = Company.objects.create(
            name="Test Corp",
            code="CORP",
            auth_company_uuid=auth_uuid,
            business_type="fmcg"
        )
        assert company.name == "Test Corp"
        
        # Verify Settings Auto-creation (save method logic)
        assert hasattr(company, 'settings')
        assert company.settings is not None
        # Default flags should be present
        assert company.settings.feature_flags.get('pos') is True

    def test_department_and_employee(self):
        """Verify HRMS relationships within Tenant"""
        auth_uuid = uuid.uuid4()
        company = Company.objects.create(
            name="HR Corp", 
            code="HR", 
            auth_company_uuid=auth_uuid
        )
        
        # Create Department
        dept = Department.objects.create(company=company, name="Engineering")
        assert dept.company == company
        
        # Create Employee
        emp = Employee.objects.create(
            company=company,
            first_name="John",
            last_name="Doe",
            department=dept,
            employee_code="E001"
        )
        assert emp.department.name == "Engineering"
        assert emp.company == company
