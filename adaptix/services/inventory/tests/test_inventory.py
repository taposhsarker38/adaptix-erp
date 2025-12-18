import pytest
import uuid
from decimal import Decimal
from apps.stocks.models import Warehouse, Stock

@pytest.mark.django_db
class TestInventoryLogic:
    def test_inventory_flow(self, company_uuid):
        """
        Migrated from verify_inventory.py
        Verifies:
        1. Warehouse creation
        2. Stock initialization
        3. Stock adjustment
        """
        product_uuid = uuid.uuid4()
        
        # 1. Create Warehouse
        warehouse = Warehouse.objects.create(
            company_uuid=company_uuid,
            name="Main Store",
            type="main"
        )
        assert warehouse.pk is not None
        
        # 2. Create Initial Stock
        stock = Stock.objects.create(
            company_uuid=company_uuid,
            warehouse=warehouse,
            product_uuid=product_uuid,
            quantity=Decimal("100.000"),
            reorder_level=Decimal("10.000"),
            avg_cost=Decimal("50.00")
        )
        assert stock.quantity == Decimal("100.000")
        
        # 3. Simulate Adjustment (Direct Model Update as per verification script)
        stock.quantity += Decimal("50.000")
        stock.save()
        
        # 4. Verify Final Count
        refetched_stock = Stock.objects.get(id=stock.id)
        assert refetched_stock.quantity == Decimal("150.000")
