
import json
import os
import pika
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.ledger.models import JournalEntry, JournalItem, ChartOfAccount, AccountGroup, SystemAccount
from django.db import transaction

class Command(BaseCommand):
    help = 'Runs the RabbitMQ consumer for Accounting Service (Zero-Touch Automation)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Accounting Consumer..."))

        amqp_url = os.environ.get("CELERY_BROKER_URL", "amqp://guest:guest@rabbitmq:5672/")
        parameters = pika.URLParameters(amqp_url)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        exchange_name = "events"
        queue_name = "accounting_queue"
        
        # Declare topic exchange
        channel.exchange_declare(exchange=exchange_name, exchange_type='topic', durable=True)
        
        # Declare queue and bind to routing key (pos.*)
        channel.queue_declare(queue=queue_name, durable=True)
        channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key="pos.*")
        channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key="asset.*")
        channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key="purchase.*")

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=queue_name, on_message_callback=self.process_message)

        self.stdout.write(self.style.SUCCESS(' [*] Waiting for Accounting messages.'))
        channel.start_consuming()

    def process_message(self, ch, method, properties, body):
        try:
            payload = json.loads(body)
            event_type = payload.get("event")
            
            if event_type == "pos.sale.closed":
                self.handle_pos_sale(payload)
                self.stdout.write(self.style.SUCCESS(f"Processed sale: {payload.get('order_number')}"))
            
            elif event_type == "asset.depreciation":
                self.handle_asset_depreciation(payload)
                self.stdout.write(self.style.SUCCESS(f"Processed depreciation: {payload.get('asset_name')}"))

            elif event_type == "purchase.order.received":
                self.handle_purchase_receipt(payload)
                self.stdout.write(self.style.SUCCESS(f"Processed purchase receipt: {payload.get('reference')}"))
                
            elif event_type == "purchase.payment.recorded":
                self.handle_purchase_payment(payload)
                self.stdout.write(self.style.SUCCESS(f"Processed purchase payment: {payload.get('reference')}"))

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error processing message: {e}"))
            # Nack if error is potentially recoverable, or ack and log if malformed
            # For now, ack to prevent loop
            ch.basic_ack(delivery_tag=method.delivery_tag)

    def get_system_account(self, company_uuid, purpose, default_code, default_name, group_type, group_code, group_name):
        """
        Helper to find a system-mapped account or fallback to defaults.
        """
        # 1. Try System Mapping
        mapping = SystemAccount.objects.filter(company_uuid=company_uuid, purpose=purpose).select_related('account').first()
        if mapping:
            return mapping.account
            
        # 2. Fallback to default code for this company
        group, _ = AccountGroup.objects.get_or_create(
            company_uuid=company_uuid,
            group_type=group_type,
            name=group_name,
            defaults={"code": group_code}
        )
        
        account, _ = ChartOfAccount.objects.get_or_create(
            company_uuid=company_uuid,
            code=default_code,
            defaults={"name": default_name, "group": group}
        )
        return account

    def handle_pos_sale(self, payload):
        company_uuid = payload.get("company_uuid")
        grand_total = Decimal(payload.get("grand_total", 0))
        order_number = payload.get("order_number")
        
        with transaction.atomic():
            # Idempotency check
            if JournalEntry.objects.filter(company_uuid=company_uuid, reference=order_number).exists():
                self.stdout.write(self.style.WARNING(f"JournalEntry for order {order_number} already exists. Skipping."))
                return

            # Create Header
            entry = JournalEntry.objects.create(
                company_uuid=company_uuid,
                wing_uuid=payload.get("wing_uuid"),
                voucher_type="receipt",
                source="pos",
                reference=order_number,
                description=f"Auto-generated entry for Sale {order_number}",
                date=payload.get("created_at")[:10], # YYYY-MM-DD
                is_posted=True,
                total_debit=grand_total,
                total_credit=grand_total
            )
            
            # Split Tax and Revenue
            items = payload.get("items", [])
            total_tax = sum(Decimal(str(item.get("tax_amount", 0))) for item in items)
            revenue_amount = grand_total - total_tax

            # Find Accounts
            revenue_account = self.get_system_account(
                company_uuid, "sales_revenue", "4000", "Sales Revenue", 
                "income", "40", "Revenue"
            )
            cash_account = self.get_system_account(
                company_uuid, "cash_on_hand", "1000", "Cash on Hand", 
                "asset", "10", "Current Assets"
            )
            tax_account = self.get_system_account(
                company_uuid, "sales_tax_payable", "2000", "Sales Tax Payable", 
                "liability", "20", "Current Liabilities"
            )
            
            # Debit Cash (Full)
            JournalItem.objects.create(
                entry=entry, account=cash_account, debit=grand_total, credit=0,
                description="Total received"
            )
            
            # Credit Sales (Revenue only)
            JournalItem.objects.create(
                entry=entry, account=revenue_account, debit=0, credit=revenue_amount,
                description="Revenue recognized"
            )

            # Credit Tax (if any)
            if total_tax > 0:
                JournalItem.objects.create(
                    entry=entry, account=tax_account, debit=0, credit=total_tax,
                    description="Tax collected"
                )

    def handle_asset_depreciation(self, payload):
        company_uuid = payload.get("company_uuid")
        amount = Decimal(payload.get("amount", 0))
        asset_name = payload.get("asset_name")
        date = payload.get("date")
        
        with transaction.atomic():
            reference = f"DEP-{payload.get('schedule_id')}"
            # Idempotency check
            if JournalEntry.objects.filter(company_uuid=company_uuid, reference=reference).exists():
                self.stdout.write(self.style.WARNING(f"Depreciation entry for {reference} already exists. Skipping."))
                return

            # Create Header
            entry = JournalEntry.objects.create(
                company_uuid=company_uuid,
                wing_uuid=payload.get("wing_uuid"),
                voucher_type="journal",
                source="other",
                reference=reference,
                description=f"Depreciation for {asset_name}",
                date=date,
                is_posted=True,
                total_debit=amount,
                total_credit=amount
            )
            
            # Find Accounts
            expense_account = self.get_system_account(
                company_uuid, "depreciation_expense", "6000", "Depreciation Expense", 
                "expense", "60", "Operating Expenses"
            )
            accumulated_account = self.get_system_account(
                company_uuid, "accumulated_depreciation", "1500", "Accumulated Depreciation", 
                "asset", "15", "Fixed Assets"
            )
            
            # Debit Expense
            JournalItem.objects.create(
                entry=entry, account=expense_account, debit=amount, credit=0,
                description=f"Expense for {asset_name}"
            )
            
            # Credit Accumulated Depreciation
            JournalItem.objects.create(
                entry=entry, account=accumulated_account, debit=0, credit=amount,
                description=f"Accumulated Dep. for {asset_name}"
            )

    def handle_purchase_receipt(self, payload):
        company_uuid = payload.get("company_uuid")
        # Ensure we treat this as a float/decimal
        total_amount = Decimal(str(payload.get("total_amount", 0)))
        reference = payload.get("reference")
        
        with transaction.atomic():
            # Idempotency check key
            ref_key = f"GRN-{reference}"
            if JournalEntry.objects.filter(company_uuid=company_uuid, reference=ref_key).exists():
                self.stdout.write(self.style.WARNING(f"GRN entry for {reference} already exists. Skipping."))
                return

            # Create Header
            entry = JournalEntry.objects.create(
                company_uuid=company_uuid,
                wing_uuid=payload.get("wing_uuid"),
                voucher_type="journal", # or 'bill' if supported
                source="purchase",
                reference=ref_key, # Use modified ref to distinguish from payment
                description=f"Goods Received for PO {reference}",
                date=transaction.now().date(), # Ideally from payload timestamp
                is_posted=True,
                total_debit=total_amount,
                total_credit=total_amount
            )
            
            # Find Accounts
            inventory_account = self.get_system_account(
                company_uuid, "inventory_asset", "1200", "Inventory Asset", 
                "asset", "12", "Current Assets"
            )
            payable_account = self.get_system_account(
                company_uuid, "accounts_payable", "2100", "Accounts Payable", 
                "liability", "21", "Current Liabilities"
            )
            
            # Debit Inventory
            JournalItem.objects.create(
                entry=entry, account=inventory_account, debit=total_amount, credit=0,
                description=f"Inventory received for {reference}"
            )
            
            # Credit Accounts Payable
            JournalItem.objects.create(
                entry=entry, account=payable_account, debit=0, credit=total_amount,
                description=f"Payable for {reference}"
            )

    def handle_purchase_payment(self, payload):
        company_uuid = payload.get("company_uuid")
        amount = Decimal(str(payload.get("amount", 0)))
        reference = payload.get("reference") # PO Reference
        payment_account_uuid = payload.get("payment_account_uuid")
        
        with transaction.atomic():
            # Idempotency check - assuming one payment event per transaction? 
            # Ideally we need a unique transaction ID from payment, but for now we might risk duplicates if replayed.
            # In V1, let's assume if exact same amount and reference on same day... but let's just create it.
            # Or use a timestamp based check if payload had it.
            
            entry = JournalEntry.objects.create(
                company_uuid=company_uuid,
                wing_uuid=payload.get("wing_uuid"),
                voucher_type="payment",
                source="purchase",
                reference=f"PAY-{reference}", # Potentially non-unique if multiple payments?
                description=f"Payment for PO {reference}",
                date=transaction.now().date(),
                is_posted=True,
                total_debit=amount,
                total_credit=amount
            )
            
            # Find Accounts
            payable_account = self.get_system_account(
                company_uuid, "accounts_payable", "2100", "Accounts Payable", 
                "liability", "21", "Current Liabilities"
            )
            
            payment_account = None
            if payment_account_uuid:
                try:
                    payment_account = ChartOfAccount.objects.get(id=payment_account_uuid, company_uuid=company_uuid)
                except ChartOfAccount.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Payment account {payment_account_uuid} not found. Fallback to cash."))
            
            if not payment_account:
                payment_account = self.get_system_account(
                    company_uuid, "cash_on_hand", "1000", "Cash on Hand", 
                    "asset", "10", "Current Assets"
                )
            
            # Debit Accounts Payable (Reducing Liability)
            JournalItem.objects.create(
                entry=entry, account=payable_account, debit=amount, credit=0,
                description=f"Payment allocation for {reference}"
            )
            
            # Credit Cash/Bank (Reducing Asset)
            JournalItem.objects.create(
                entry=entry, account=payment_account, debit=0, credit=amount,
                description=f"Payment outbound"
            )
