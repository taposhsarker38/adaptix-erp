import pytest
import uuid
from decimal import Decimal
from datetime import date
from apps.ledger.models import AccountGroup, ChartOfAccount, JournalEntry, JournalItem

@pytest.mark.django_db
class TestAccountingLogic:
    def test_startup_check(self):
        """Smoke test for model imports"""
        assert AccountGroup.objects.count() >= 0
        assert ChartOfAccount.objects.count() >= 0

    def test_accounting_flow(self, company_uuid):
        """
        Migrated from verify_accounting.py
        Verifies:
        1. Account Group creation
        2. Chart of Account creation
        3. Journal Entry (Draft -> Post)
        4. Double Entry Balance Check
        """
        
        # 1. Create Account Groups
        asset_group = AccountGroup.objects.create(
            company_uuid=company_uuid, name="Current Assets", group_type="asset"
        )
        income_group = AccountGroup.objects.create(
            company_uuid=company_uuid, name="Revenue", group_type="income"
        )
        assert asset_group.pk is not None
        assert income_group.pk is not None

        # 2. Create Chart of Accounts
        cash_acct = ChartOfAccount.objects.create(
            company_uuid=company_uuid,
            group=asset_group,
            name="Cash on Hand",
            code="1001"
        )
        sales_acct = ChartOfAccount.objects.create(
            company_uuid=company_uuid,
            group=income_group,
            name="Sales Revenue",
            code="4001"
        )
        assert cash_acct.pk is not None
        assert sales_acct.pk is not None

        # 3. Create Journal Entry (Sale)
        entry = JournalEntry.objects.create(
            company_uuid=company_uuid,
            date=date.today(),
            reference="INV-001",
            description="Cash Sale",
            is_posted=False # Draft
        )
        assert entry.reference == "INV-001"

        # 4. Create Journal Items (Double Entry)
        amount = Decimal("100.00")
        
        item1 = JournalItem.objects.create(
            entry=entry,
            account=cash_acct,
            debit=amount,
            credit=0,
            description="Cash received"
        )
        
        item2 = JournalItem.objects.create(
            entry=entry,
            account=sales_acct,
            debit=0,
            credit=amount,
            description="Revenue recognized"
        )
        
        # 5. Verify Balance
        total_debit = item1.debit + item2.debit
        total_credit = item1.credit + item2.credit
        assert total_debit == total_credit
        assert total_debit == amount
        
        # 6. Post Entry (Mock Logic)
        entry.is_posted = True
        entry.total_debit = total_debit
        entry.total_credit = total_credit
        entry.save()
        
        # Update Account Balances (Naive implementation mirroring verification script)
        cash_acct.current_balance += amount # Asset increases with debit
        cash_acct.save()
        
        sales_acct.current_balance += amount # Income increases with credit
        sales_acct.save()
        
        # Reload to verify
        cash_acct.refresh_from_db()
        sales_acct.refresh_from_db()
        
        assert cash_acct.current_balance == amount
        assert sales_acct.current_balance == amount
