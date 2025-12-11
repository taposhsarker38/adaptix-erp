import os
import django
import uuid
import sys
from datetime import date
from decimal import Decimal

# Add the service directory to python path
sys.path.append('/app')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.assets.models import AssetCategory, Asset, DepreciationSchedule

def run_test():
    company_uuid = str(uuid.uuid4())
    print(f"🏢 Company UUID: {company_uuid}")
    
    # 1. Create Category
    laptop_cat = AssetCategory.objects.create(
        company_uuid=company_uuid,
        name="Business Laptops",
        depreciation_rate=20.00, # 20%
        useful_life_years=5
    )
    print(f"✅ Created Category: {laptop_cat}")

    # 2. Create Asset
    macbook = Asset.objects.create(
        company_uuid=company_uuid,
        category=laptop_cat,
        name="MacBook Pro M3",
        code="AST-001",
        serial_number="DJK238DJK",
        purchase_date=date(2025, 1, 1),
        purchase_cost=200000, # 2 Lakh
        current_value=200000,
        status="active"
    )
    print(f"✅ Created Asset: {macbook}")

    # 3. Simulate Depreciation (Straight Line)
    # 20% of 2 Lakh = 40k per year
    depreciation_amount = macbook.purchase_cost * (laptop_cat.depreciation_rate / 100)
    
    schedule = DepreciationSchedule.objects.create(
        asset=macbook,
        date=date(2026, 1, 1),
        amount=depreciation_amount,
        opening_value=macbook.current_value,
        closing_value=macbook.current_value - depreciation_amount
    )
    
    macbook.current_value = schedule.closing_value
    macbook.save()
    
    print(f"✅ Depreciated Asset: New Value = {macbook.current_value}")
    
    assert macbook.current_value == 160000
    print("✅ Verification Successful!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
