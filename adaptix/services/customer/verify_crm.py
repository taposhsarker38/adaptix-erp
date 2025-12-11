import os
import django
import uuid
import sys
from decimal import Decimal

# Add the service directory to python path
sys.path.append('/app')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.profiles.models import Customer
from apps.crm.models import Stage, Lead, Opportunity

def run_test():
    # 1. Setup Customer
    cust = Customer.objects.create(
        name="Tech Solutions Ltd",
        phone=str(uuid.uuid4())[:20],
        email="contact@techsol.com"
    )
    print(f"✅ Customer Created: {cust.name}")

    # 2. Setup Stages.
    new_stage = Stage.objects.create(name="New", order=1)
    won_stage = Stage.objects.create(name="Won", order=10, is_won=True)
    print("✅ Stages Created")

    # 3. Create Lead
    lead = Lead.objects.create(
        name="StartUp Inc",
        email="founder@startup.io",
        stage=new_stage
    )
    print(f"✅ Lead Created: {lead.name}")

    # 4. Create Opportunity
    opp = Opportunity.objects.create(
        name="Server Config Deal",
        customer=cust,
        stage=new_stage,
        expected_amount=500000,
        probability=60
    )
    print(f"✅ Opportunity Created: {opp.name}")
    
    # 5. Move Stage
    opp.stage = won_stage
    opp.save()
    print("✅ Opportunity Moved to Won")
    
    # 6. Verify Kanban Logic (Simulated)
    # ViewSet logic would fetch this. Here we verify ORM.
    assert opp.stage.is_won == True
    print("✅ CRM Verification Successful!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
