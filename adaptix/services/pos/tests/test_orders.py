import pytest
from rest_framework import status
from apps.sales.models import Order
from decimal import Decimal

@pytest.mark.django_db
class TestOrderCreation:
    def test_create_order_success(self, auth_client, company_uuid, user, mock_permissions):
        """Test creating a simple order."""
        payload = {
            "customer_uuid": "e8a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5",
            "items": [
                {
                    "product_uuid": "a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6",
                    "product_name": "Test Product",
                    "quantity": 2,
                    "unit_price": "50.00"
                }
            ],
            "total_amount": "100.00",
            "payment_data": [{
                "method": "cash",
                "amount": "100.00"
            }]
        }
        
        response = auth_client.post("/api/pos/orders/", payload, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED, f"Response: {response.data}"
        assert Order.objects.count() == 1
        
        order = Order.objects.first()
        # subtotal = 2 * 50 = 100
        assert order.subtotal == Decimal("100.00")
        assert order.grand_total == Decimal("100.00")
        assert str(order.company_uuid) == company_uuid
        # created_by will be "system" because our mock middleware doesn't inject 'sub'
        assert order.created_by == "system"

    def test_create_order_invalid_payload(self, auth_client, mock_permissions):
        """Test validation error."""
        # Invalid: Missing product_name in items
        payload = {
            "items": [
                {"product_uuid": "123"} 
            ]
        }
        response = auth_client.post("/api/pos/orders/", payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_permissions(self, api_client):
        """Test unauthenticated access fails."""
        # We Do NOT use mock_permissions here, so check should fail
        response = api_client.post("/api/pos/orders/", {}, format='json')
        # Expect 403 Forbidden (or 401 if logic dictates)
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
