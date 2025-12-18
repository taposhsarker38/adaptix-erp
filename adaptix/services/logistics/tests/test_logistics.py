import pytest
import uuid
from apps.shipping.models import Vehicle, Shipment, DeliveryRoute

@pytest.mark.django_db
class TestLogisticsLogic:
    def test_vehicle_creation(self):
        """Verify Vehicle creation"""
        vehicle = Vehicle.objects.create(
            license_plate="XYZ-123",
            capacity=1000.0,
            model="Ford Transit",
            status="AVAILABLE"
        )
        assert vehicle.license_plate == "XYZ-123"
        assert vehicle.status == "AVAILABLE"

    def test_shipment_flow(self):
        """Verify Shipment creation and Route assignment"""
        # Create Vehicle
        vehicle = Vehicle.objects.create(
            license_plate="TRUCK-001",
            capacity=5000.0,
            model="Volvo FH16"
        )
        
        # Create Route
        route = DeliveryRoute.objects.create(
            vehicle=vehicle,
            status="PLANNED",
            driver_uuid=uuid.uuid4()
        )
        
        # Create Shipment
        shipment = Shipment.objects.create(
            order_uuid=uuid.uuid4(),
            destination_address="123 Main St",
            customer_name="John Doe",
            customer_phone="555-0199",
            status="PENDING"
        )
        
        # Assign to Route
        shipment.route = route
        shipment.status = "SHIPPED"
        shipment.save()
        
        shipment.refresh_from_db()
        assert shipment.route == route
        assert shipment.status == "SHIPPED"
        assert route.shipments.count() == 1
