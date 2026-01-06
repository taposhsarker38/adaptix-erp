import json
from django.core.management.base import BaseCommand
from kombu import Connection, Exchange, Queue, Consumer
from apps.vision.models import FaceEmbedding

class Command(BaseCommand):
    help = 'Runs the Face Sync Consumer for Global Identity'

    def handle(self, *args, **options):
        import os
        broker_url = os.environ.get("RABBITMQ_URL", "amqp://adaptix:adaptix123@rabbitmq:5672/")

        exchange = Exchange("events", type="topic", durable=True)
        # Queue specifically for biometric sync
        queue = Queue("face_sync_updates", exchange=exchange, routing_key="face.global_sync")

        self.stdout.write(f"[*] Biometric Sync Worker starting on {broker_url}...")
        self.stdout.write(f"[*] Listening for 'face.global_sync' events...")

        try:
            with Connection(broker_url) as conn:
                with Consumer(conn, queues=[queue], callbacks=[self.process_message], accept=['json']):
                    while True:
                        conn.drain_events()
        except KeyboardInterrupt:
            self.stdout.write(self.style.SUCCESS("Worker stopped."))

    def process_message(self, body, message):
        """
        Processes incoming global face embeddings and saves them to local DB.
        """
        try:
            data = body
            if isinstance(data, str):
                data = json.loads(data)
            
            face_uuid = data.get("face_uuid")
            customer_uuid = data.get("customer_uuid")
            embedding = data.get("embedding")
            branch_uuid = data.get("branch_uuid")
            version = data.get("version", "v1")

            if not face_uuid or not embedding:
                self.stdout.write(self.style.WARNING("Ignoring malformed face sync event"))
                message.ack()
                return

            # Check if this face embedding already exists locally
            # We use the global UUID sent by the cloud relay
            face, created = FaceEmbedding.objects.get_or_create(
                uuid=face_uuid,
                defaults={
                    "customer_uuid": customer_uuid,
                    "embedding": embedding,
                    "branch_uuid": branch_uuid,
                    "version": version,
                    "is_synced": True # Marked as synced since it came from the sync bus
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Successfully synced global identity: {face_uuid}"))
            else:
                self.stdout.write(self.style.NOTICE(f"Identity {face_uuid} already exists in local cache."))

            message.ack()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Critical error in Biometric Sync: {e}"))
            # In production, we might want to nack or DLQ this
            message.ack()
