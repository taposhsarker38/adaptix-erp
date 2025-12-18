import pytest
import json
from decimal import Decimal
from django.utils import timezone
from apps.analytics.models import DailySales, TopProduct, Transaction
from apps.analytics.consumers import SalesEventConsumer

@pytest.mark.django_db
class TestReportingLogic:
    def test_consumer_aggregation(self):
        """
        Verify that SalesEventConsumer correctly aggregates data 
        into DailySales and TopProduct models.
        """
        consumer = SalesEventConsumer()
        
        # Simulating data payload from POS
        now_iso = timezone.now().isoformat()
        payload = {
            "event": "pos.sale.closed",
            "order_number": "ORD-123",
            "grand_total": "100.50",
            "created_at": now_iso,
            "items": [
                {"name": "Coffee", "quantity": 2},
                {"name": "Bagel", "quantity": 1}
            ]
        }
        
        # Manually triggering handler
        consumer.handle_sale_closed(payload)
        
        # Verify Transaction Log
        assert Transaction.objects.count() == 1
        assert Transaction.objects.first().event_type == "pos.sale.closed"
        
        # Verify Daily Sales
        daily = DailySales.objects.first()
        assert daily is not None
        assert daily.total_revenue == Decimal("100.50")
        assert daily.total_transactions == 1
        
        # Verify Top Products
        coffee = TopProduct.objects.get(product_name="Coffee")
        bagel = TopProduct.objects.get(product_name="Bagel")
        
        assert coffee.total_sold == 2
        assert bagel.total_sold == 1
        
        # Process a second order to verify increment
        payload2 = {
            "event": "pos.sale.closed",
            "order_number": "ORD-124",
            "grand_total": "50.00",
            "created_at": now_iso,
            "items": [
                {"name": "Coffee", "quantity": 1}
            ]
        }
        consumer.handle_sale_closed(payload2)
        
        daily.refresh_from_db()
        assert daily.total_revenue == Decimal("150.50") # 100.50 + 50.00
        assert daily.total_transactions == 2
        
        coffee.refresh_from_db()
        assert coffee.total_sold == 3 # 2 + 1

    def test_dashboard_api(self, api_client):
        """
        Verify Dashboard API returns aggregated stats.
        Populate DB first.
        """
        today = timezone.now().date()
        DailySales.objects.create(
            date=today,
            total_revenue=Decimal("1000.00"),
            total_transactions=10
        )
        
        TopProduct.objects.create(product_name="Pizza", total_sold=50)
        
        url = "/api/reporting/dashboard/dashboard/" 
        
        response = api_client.get(url)
        
        assert response.status_code == 200
        assert Decimal(str(response.data['total_revenue'])) == Decimal("1000.00")
        assert response.data['total_transactions'] == 10
        assert len(response.data['top_products']) >= 1
        assert response.data['top_products'][0]['product_name'] == "Pizza"
