from django.core.management.base import BaseCommand
from apps.loyalty.models import LoyaltyProgram, LoyaltyTier
from django.db import connection

class Command(BaseCommand):
    help = 'Creates default loyalty program with tiers'

    def handle(self, *args, **kwargs):
        # Get company_uuid from connection schema
        schema = connection.schema_name if hasattr(connection, 'schema_name') else 'customer'
        
        # Use a default company UUID (you can change this)
        import uuid
        default_company_uuid = uuid.uuid4()
        
        # Check if a loyalty program already exists
        if LoyaltyProgram.objects.exists():
            self.stdout.write(self.style.WARNING('Loyalty program already exists. Activating it...'))
            program = LoyaltyProgram.objects.first()
            program.is_active = True
            program.save()
        else:
            # Create program
            program = LoyaltyProgram.objects.create(
                name="Adaptix Rewards",
                earn_rate=1.0,  # 1 point per 1 unit spent
                redemption_rate=0.01,  # 1 point = 0.01 currency
                is_active=True,
                target_audience='customer',
                company_uuid=default_company_uuid
            )
            self.stdout.write(self.style.SUCCESS(f'Created loyalty program: {program.name}'))
        
        # Create tiers if they don't exist
        tier_data = [
            {'name': 'SILVER', 'min_points': 0, 'multiplier': 1.0},
            {'name': 'GOLD', 'min_points': 1000, 'multiplier': 1.5},
            {'name': 'PLATINUM', 'min_points': 5000, 'multiplier': 2.0},
            {'name': 'ELITE', 'min_points': 10000, 'multiplier': 3.0},
        ]
        
        for tier_info in tier_data:
            tier, created = LoyaltyTier.objects.get_or_create(
                program=program,
                name=tier_info['name'],
                defaults={
                    'min_points': tier_info['min_points'],
                    'multiplier': tier_info['multiplier']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created tier: {tier.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Tier already exists: {tier.name}'))
        
        self.stdout.write(self.style.SUCCESS('✅ Loyalty program is now active with all tiers!'))
