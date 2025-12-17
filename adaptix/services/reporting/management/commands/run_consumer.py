from django.core.management.base import BaseCommand
from apps.analytics.consumers import SalesEventConsumer
import time

class Command(BaseCommand):
    help = 'Runs the Sales Event Consumer'

    def handle(self, *args, **kwargs):
        self.stdout.write("Waiting for RabbitMQ...")
        # Simple retry logic or let it fail and restart
        try:
             consumer = SalesEventConsumer()
             consumer.run()
        except KeyboardInterrupt:
            self.stdout.write("Stopping consumer...")
        except Exception as e:
            self.stderr.write(f"Error: {e}")
            # Crash so Docker restarts it
            import sys
            sys.exit(1)
