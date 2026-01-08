import json
import pika
import os
import django
from decimal import Decimal

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.loyalty.models import LoyaltyAccount, LoyaltyTransaction, LoyaltyProgram
from apps.profiles.models import Customer
from django.db import transaction as db_transaction

def process_sale_completed(ch, method, properties, body):
    """Process sale completed event and award loyalty points"""
    try:
        data = json.loads(body)
        print(f"📦 Received sale event: {data}")
        
        # POS publishes: customer_uuid, grand_total, order_id
        customer_id = data.get('customer_uuid')
        total_amount = Decimal(str(data.get('grand_total', 0)))
        order_id = data.get('order_id')
        
        if not customer_id or total_amount <= 0:
            print(f"⚠️  Skipping: No customer ('{customer_id}') or invalid amount ({total_amount})")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
        
        # Get customer's loyalty account
        try:
            account = LoyaltyAccount.objects.select_related('program', 'customer').get(
                customer_id=customer_id
            )
        except LoyaltyAccount.DoesNotExist:
            print(f"⚠️  No loyalty account found for customer {customer_id}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
        
        if not account.program or not account.program.is_active:
            print(f"⚠️  No active loyalty program for customer {customer_id}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
        
        # Calculate points earned
        earn_rate = account.program.earn_rate
        multiplier = account.current_tier.multiplier if account.current_tier else Decimal('1.0')
        
        base_points = int(total_amount * earn_rate)
        bonus_points = int(base_points * (multiplier - Decimal('1.0')))
        total_points = base_points + bonus_points
        
        print(f"💰 Awarding {total_points} points (base: {base_points}, bonus: {bonus_points})")
        
        # Create transaction and update account
        with db_transaction.atomic():
            LoyaltyTransaction.objects.create(
                account=account,
                transaction_type='earn',
                points=total_points,
                description=f"Purchase - Order #{order_id}",
                reference_id=str(order_id),
                created_by='system'
            )
            
            account.balance += total_points
            account.lifetime_points += total_points
            account.save()
            
            # Check for tier upgrade
            upgraded, old_tier, new_tier = account.auto_upgrade_tier()
            
            if upgraded:
                print(f"🎉 Customer upgraded from {old_tier} to {new_tier}!")
        
        print(f"✅ Successfully awarded {total_points} points to {account.customer.name}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"❌ Error processing sale event: {e}")
        import traceback
        traceback.print_exc()
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://adaptix:adaptix123@localhost:5672/')
    
    print(f"🔌 Connecting to RabbitMQ: {rabbitmq_url}")
    connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
    channel = connection.channel()
    
    # Declare exchange and queue (use existing POS events exchange)
    channel.exchange_declare(exchange='events', exchange_type='topic', durable=True)
    channel.queue_declare(queue='loyalty_points_queue', durable=True)
    channel.queue_bind(
        exchange='events',
        queue='loyalty_points_queue',
        routing_key='pos.sale.closed'
    )
    
    print("👂 Listening for POS sale events on 'pos.sale.closed'...")
    channel.basic_consume(
        queue='loyalty_points_queue',
        on_message_callback=process_sale_completed
    )
    
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user")
        channel.stop_consuming()
    finally:
        connection.close()

if __name__ == '__main__':
    main()
