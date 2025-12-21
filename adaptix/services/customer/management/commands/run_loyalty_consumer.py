from django.core.management.base import BaseCommand
from kombu import Connection, Exchange, Queue, Consumer
import json
import os
from django.conf import settings
from apps.loyalty.models import LoyaltyAccount, LoyaltyTransaction
from apps.profiles.models import Customer
from django.db import transaction
from decimal import Decimal

class Command(BaseCommand):
    help = 'Runs the Loyalty Event Consumer'

    def handle(self, *args, **options):
        rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
        self.stdout.write(f"Connecting to {rabbitmq_url}...")
        
        exchange = Exchange("events", type="topic", durable=True)
        queue = Queue("loyalty_updates", exchange=exchange, routing_key="pos.sale.closed")

        with Connection(rabbitmq_url) as conn:
            self.stdout.write("Connected to RabbitMQ. Waiting for events...")
            
            with Consumer(conn, queues=queue, callbacks=[self.process_message]):
                while True:
                    conn.drain_events()

    def process_message(self, body, message):
        try:
            data = json.loads(body)
            event_type = data.get('event')
            
            if event_type == "pos.sale.closed":
                self.handle_sale_closed(data)
            
            message.ack()
        except Exception as e:
            self.stderr.write(f"Error processing message: {e}")
            # message.reject(requeue=False) # Or requeue=True depending on policy

    def handle_sale_closed(self, data):
        customer_uuid = data.get('customer_uuid')
        grand_total = data.get('grand_total')
        order_id = data.get('order_id')
        
        if not customer_uuid or not grand_total:
            return

        self.stdout.write(f"Processing sale for Customer {customer_uuid}. Total: {grand_total}")

        try:
            # Logic: 1 Point per 10 Units
            points = int(float(grand_total) / 10)
            
            if points > 0:
                with transaction.atomic():
                    # Find Customer
                    try:
                        customer = Customer.objects.get(id=customer_uuid)
                    except Customer.DoesNotExist:
                        self.stderr.write(f"Customer {customer_uuid} not found")
                        return

                    # Get/Create Loyalty Account
                    account, _ = LoyaltyAccount.objects.get_or_create(customer=customer)
                    
                    # Prevent duplicate processing for same order (Idempotency)
                    if LoyaltyTransaction.objects.filter(reference_id=order_id, transaction_type='earn').exists():
                        self.stdout.write(f"Order {order_id} already processed.")
                        return

                    # Update Balance
                    account.balance += points
                    account.lifetime_points += points
                    account.save()
                    
                    # Create Transaction Log
                    LoyaltyTransaction.objects.create(
                        account=account,
                        transaction_type='earn',
                        points=points,
                        description=f'Points earned from Order {data.get("order_number")}',
                        reference_id=order_id,
                        created_by='system'
                    )
                    
                    # Sync to Customer Profile
                    customer.loyalty_points = Decimal(account.balance)
                    customer.calculate_tier()
                    customer.save()
                    
                    self.stdout.write(f"Awarded {points} points to {customer.name}.")

        except Exception as e:
            self.stderr.write(f"Failed to award points: {e}")
