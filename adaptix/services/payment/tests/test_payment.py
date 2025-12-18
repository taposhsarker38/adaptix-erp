import pytest
import uuid
from decimal import Decimal
from apps.payments.models import Payment, Transaction

@pytest.mark.django_db
class TestPaymentLogic:
    def test_payment_flow(self):
        """Verify Payment creation and status update flow"""
        order_id = uuid.uuid4()
        
        # 1. Create Payment (Pending)
        payment = Payment.objects.create(
            order_id=order_id,
            amount=Decimal("150.00"),
            currency="USD",
            status="pending",
            method="card"
        )
        assert payment.status == "pending"
        assert payment.amount == Decimal("150.00")
        
        # 2. Simulate Gateway Transaction (Success)
        transaction = Transaction.objects.create(
            payment=payment,
            status="succeeded",
            gateway_response={"id": "ch_12345", "outcome": "approved"}
        )
        assert transaction.status == "succeeded"
        
        # 3. Update Payment Status
        payment.status = "completed"
        payment.stripe_charge_id = "ch_12345"
        payment.save()
        
        # 4. Verify Final State
        payment.refresh_from_db()
        assert payment.status == "completed"
        assert payment.transactions.count() == 1
        assert payment.stripe_charge_id == "ch_12345"
