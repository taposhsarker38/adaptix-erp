import json
import logging
import os
import pika
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from apps.ledger.models import ChartOfAccount, JournalEntry, JournalItem, AccountGroup

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Runs the accounting event consumer'

    def handle(self, *args, **options):
        # Retry connection logic could be added here
        params = pika.URLParameters(settings.CELERY_BROKER_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(exchange='events', exchange_type='topic', durable=True)
        
        # Payroll Queue
        queue_name = 'accounting_payroll_queue'
        channel.queue_declare(queue=queue_name, durable=True)
        channel.queue_bind(exchange='events', queue=queue_name, routing_key='hrms.payroll.finalized')

        def callback(ch, method, properties, body):
            try:
                data = json.loads(body)
                event_type = data.get('type')
                
                if event_type == 'payroll_finalized':
                    self.process_payroll(data)

                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                # ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False) # Dead letter?

        logger.info(' [*] Waiting for Accounting events...')
        channel.basic_consume(queue=queue_name, on_message_callback=callback)
        channel.start_consuming()

    def process_payroll(self, data):
        company_uuid = data['company_uuid']
        net_pay = Decimal(str(data['net_pay']))
        payslip_id = data['payslip_id']
        period = f"{data['period_start']} to {data['period_end']}"
        
        logger.info(f"Processing Payroll Journal for: {net_pay}")

        # 1. Get/Create Accounts (Simplified for demo)
        expense_account = self.get_or_create_account(company_uuid, "Salaries Expense", "expense", "5001")
        liability_account = self.get_or_create_account(company_uuid, "Salaries Payable", "liability", "2001")

        # 2. Create Journal Entry
        entry = JournalEntry.objects.create(
            company_uuid=company_uuid,
            date=timezone.now().date(),
            reference=f"PAYAP-{payslip_id[:8]}",
            description=f"Payroll Automation: {period}",
            total_debit=net_pay,
            total_credit=net_pay
        )

        # 3. Create Items (Debit Expense, Credit Liability)
        JournalItem.objects.create(
            entry=entry,
            account=expense_account,
            debit=net_pay,
            credit=0,
            description="Salary Expense"
        )
        JournalItem.objects.create(
            entry=entry,
            account=liability_account,
            debit=0,
            credit=net_pay,
            description="Net Pay Payable"
        )
        logger.info(f"✅ Journal Entry Created: {entry.reference}")

    def get_or_create_account(self, company_uuid, name, group_type, code):
        # Super simplified: Find by code or create
        account = ChartOfAccount.objects.filter(company_uuid=company_uuid, code=code).first()
        if not account:
            # Need a group first
            group, _ = AccountGroup.objects.get_or_create(
                company_uuid=company_uuid,
                name=f"{group_type.title()} Group",
                defaults={'group_type': group_type}
            )
            account = ChartOfAccount.objects.create(
                company_uuid=company_uuid,
                group=group,
                name=name,
                code=code,
                is_active=True
            )
        return account
