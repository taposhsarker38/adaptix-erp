import pytest
import uuid
from decimal import Decimal
from apps.profiles.models import Customer
from apps.crm.models import Stage, Lead, Opportunity

@pytest.mark.django_db
class TestCustomerLogic:
    def test_customer_tier_calculation(self):
        """Verify Tier logic based on points"""
        cust = Customer.objects.create(
            name="Tier Test Inc",
            phone=str(uuid.uuid4())[:20],
            email="tier@test.com",
            loyalty_points=Decimal("0.00")
        )
        assert cust.tier == Customer.Tier.SILVER
        
        # Upgrade to Gold
        cust.loyalty_points = Decimal("600.00")
        cust.calculate_tier()
        cust.refresh_from_db()
        assert cust.tier == Customer.Tier.GOLD
        
        # Upgrade to Platinum
        cust.loyalty_points = Decimal("1500.00")
        cust.calculate_tier()
        assert cust.tier == Customer.Tier.PLATINUM

    def test_crm_opportunity_flow(self):
        """Verify Lead -> Opportunity flow"""
        # Setup Stages
        stage_new = Stage.objects.create(name="New", order=1)
        stage_won = Stage.objects.create(name="Won", order=2, is_won=True)
        
        # Create Customer
        cust = Customer.objects.create(name="Deal Maker", phone="1234567890")
        
        # Create Opportunity
        opp = Opportunity.objects.create(
            name="Big Deal",
            customer=cust,
            stage=stage_new,
            expected_amount=Decimal("50000.00")
        )
        
        assert opp.stage.is_won is False
        
        # Move Stage
        opp.stage = stage_won
        opp.save()
        
        opp.refresh_from_db()
        assert opp.stage.is_won is True
