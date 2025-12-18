import pytest
import uuid
from datetime import date
from decimal import Decimal
from apps.assets.models import AssetCategory, Asset, DepreciationSchedule

@pytest.mark.django_db
class TestAssetLogic:
    def test_asset_depreciation_flow(self):
        """Verify Asset creation and depreciation calculation"""
        company_uuid = uuid.uuid4()
        
        # 1. Create Category
        laptop_cat = AssetCategory.objects.create(
            company_uuid=company_uuid,
            name="Business Laptops",
            depreciation_rate=Decimal("20.00"), # 20%
            useful_life_years=5
        )
        assert laptop_cat.name == "Business Laptops"

        # 2. Create Asset
        macbook = Asset.objects.create(
            company_uuid=company_uuid,
            category=laptop_cat,
            name="MacBook Pro M3",
            code="AST-001",
            serial_number="DJK238DJK",
            purchase_date=date(2025, 1, 1),
            purchase_cost=Decimal("200000.00"), # 2 Lakh
            current_value=Decimal("200000.00"),
            status="active"
        )
        assert macbook.current_value == Decimal("200000.00")

        # 3. Simulate Depreciation (Straight Line)
        # 20% of 200,000 = 40,000
        depreciation_amount = macbook.purchase_cost * (laptop_cat.depreciation_rate / 100)
        assert depreciation_amount == Decimal("40000.00")
        
        schedule = DepreciationSchedule.objects.create(
            asset=macbook,
            date=date(2026, 1, 1),
            amount=depreciation_amount,
            opening_value=macbook.current_value,
            closing_value=macbook.current_value - depreciation_amount
        )
        
        macbook.current_value = schedule.closing_value
        macbook.save()
        
        macbook.refresh_from_db()
        assert macbook.current_value == Decimal("160000.00")
