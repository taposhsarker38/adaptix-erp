import pytest
import uuid
from decimal import Decimal
from apps.products.models import Product, Category, Brand

@pytest.mark.django_db
class TestProductLogic:
    def test_startup_check(self):
        """Verifies that Django setup and model imports work (Smoke Test)"""
        assert Product.objects.count() >= 0
        assert Category.objects.count() >= 0
        assert Brand.objects.count() >= 0

    def test_create_product(self, company_uuid):
        """Verifies basic product creation logic"""
        category = Category.objects.create(
            company_uuid=company_uuid,
            name="Test Category"
        )
        
        brand = Brand.objects.create(
            company_uuid=company_uuid,
            name="Test Brand"
        )
        
        product = Product.objects.create(
            company_uuid=company_uuid,
            name="Test Product",
            category=category,
            brand=brand,
            product_type="standard"
        )
        
        # Create Variant (where price/sku lives)
        from apps.products.models import ProductVariant
        variant = ProductVariant.objects.create(
            company_uuid=company_uuid,
            product=product,
            name="Default",
            sku=f"SKU-{uuid.uuid4()}",
            price=Decimal("20.00"),
            cost=Decimal("10.00"),
            quantity=Decimal("100.00")
        )
        
        assert product.pk is not None
        assert product.company_uuid == company_uuid
        assert str(product.name) == "Test Product"
        assert variant.price == Decimal("20.00")
