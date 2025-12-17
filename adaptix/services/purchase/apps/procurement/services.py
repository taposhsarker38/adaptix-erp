import requests
from django.conf import settings

class InventoryService:
    @staticmethod
    def increase_stock(order_item, company_uuid, warehouse_id, token):
        """
        Call Inventory Service Synchronously to adjust stock.
        """
        import requests
        
        # Internal URL for Inventory Service (Docker Service Name)
        url = "http://inventory:8000/api/inventory/stocks/adjust/"
        
        payload = {
            "warehouse_id": warehouse_id,
            "product_uuid": str(order_item.product_uuid),
            "quantity": float(order_item.quantity),
            "type": "add",
            "notes": f"PO #{order_item.order.reference_number}"
        }
        
        headers = {
            "Authorization": token, # Pass through the JWT
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code >= 400:
                print(f"Inventory Error: {response.text}")
                return False
            return True
        except Exception as e:
            print(f"Failed to call inventory service: {e}")
            return False
