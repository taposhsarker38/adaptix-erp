import json
from kombu import Connection, Exchange, Queue, Consumer
from django.conf import settings
from .models import DailySales, TopProduct, Transaction
from django.db import transaction
from dateutil.parser import parse
from django.db.models import F

class SalesEventConsumer:
    def __init__(self):
        self.broker_url = getattr(settings, "CELERY_BROKER_URL", "amqp://guest:guest@rabbitmq:5672/")
        self.exchange = Exchange("events", type="topic", durable=True)
        self.queue = Queue("reporting_sales_queue", exchange=self.exchange, routing_key="pos.#")

    def process_message(self, body, message):
        try:
            data = json.loads(body)
            event_type = data.get("event")
            
            print(f"Received event: {event_type}")

            if event_type == "pos.sale.closed":
                self.handle_sale_closed(data)
            
            message.ack()
        except Exception as e:
            print(f"Error processing message: {e}")
            message.reject()

    def handle_sale_closed(self, data):
        # 1. Log Transaction
        Transaction.objects.create(
            event_type="pos.sale.closed",
            data=data
        )

        grand_total = float(data.get("grand_total", 0))
        created_at_iso = data.get("created_at")
        date_obj = parse(created_at_iso).date()

        # 2. Update Daily Sales
        daily, _ = DailySales.objects.get_or_create(date=date_obj)
        # Use F objects for atomic increments
        daily.total_revenue = F('total_revenue') + grand_total
        daily.total_transactions = F('total_transactions') + 1
        daily.save()

        # 3. Update Top Products
        items = data.get("items", [])
        for item in items:
            product_name = item.get("name", "Unknown Product")
            qty = float(item.get("quantity", 0))
            
            # Simple aggregation by name for now (ideal: by UUID)
            # Using name because TopProduct model uses name
            prod, _ = TopProduct.objects.get_or_create(product_name=product_name)
            prod.total_sold = F('total_sold') + int(qty)
            prod.save()
            
        print(f"Processed Sale: {data.get('order_number')}")

    def run(self):
        print("Starting Sales Event Consumer...")
        with Connection(self.broker_url) as conn:
            with Consumer(conn, [self.queue], callbacks=[self.process_message]):
                while True:
                    conn.drain_events()
