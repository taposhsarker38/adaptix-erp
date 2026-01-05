import os
import django
import uuid
import sys

# Setup Django for manufacturing service
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.mrp.models import ProductionOrder
from django.db import connections

# Find orders in QUALITY_CHECK
orders = ProductionOrder.objects.filter(status='QUALITY_CHECK')
print(f"Found {len(orders)} orders in QUALITY_CHECK status.")

# Connect to quality schema directly to create inspections
with connections['default'].cursor() as cursor:
    cursor.execute("SET search_path TO quality, public")
    
    for order in orders:
        # Check if inspection exists
        cursor.execute(
            "SELECT id FROM quality_inspection WHERE reference_uuid = %s AND reference_type = 'PRODUCTION'",
            [str(order.uuid)]
        )
        if cursor.fetchone():
            print(f"Inspection already exists for Order #{order.id} (UUID: {order.uuid})")
            continue
            
        # Create inspection (let DB handle auto-id, provide rework_count)
        cursor.execute(
            """
            INSERT INTO quality_inspection (reference_type, reference_uuid, status, notes, inspection_date, rework_count)
            VALUES ('PRODUCTION', %s, 'PENDING', %s, NOW(), 0)
            """,
            [str(order.uuid), f"Backfilled missing inspection for Order #{order.id}"]
        )
        print(f"✅ Created inspection for Order #{order.id}")

print("Backfill complete.")
