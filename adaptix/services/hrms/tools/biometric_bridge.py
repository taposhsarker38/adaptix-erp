import json
import time
import urllib.request
import urllib.error
from datetime import datetime

import os

# ==========================================
# CONFIGURATION
# ==========================================
# Ensure this URL is reachable from where you run the script. 
# If running on host, localhost:8000 (Kong) -> HRMS.
HRMS_URL = os.environ.get("HRMS_URL", "http://localhost:8000/api/hrms/attendance/sync/")
DEVICE_IP = "192.168.1.201" 

# ==========================================
# MOCK DEVICE DRIVER
# ==========================================
def fetch_logs_from_device():
    print(f"Connecting to Device at {DEVICE_IP}...")
    # Mock Data
    return [
        {"user_id": "EMP001", "device_id": "ZK01", "timestamp": str(datetime.now()), "status": "CheckIn"}
    ]

# ==========================================
# SYNC LOGIC
# ==========================================
def sync_data():
    logs = fetch_logs_from_device()
    
    if not logs:
        print("No new logs found.")
        return

    print(f"Sending {len(logs)} logs to HRMS at {HRMS_URL}...")
    
    try:
        data = json.dumps(logs).encode('utf-8')
        req = urllib.request.Request(HRMS_URL, data=data, headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode('utf-8')
            print("Successfully synced!", resp_body)
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")
    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    # Run once for testing
    sync_data()
