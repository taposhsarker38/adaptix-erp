from django.core.management.base import BaseCommand
from apps.loyalty.models import LoyaltyProgram, LoyaltyAccount, LoyaltyTier
from apps.profiles.models import Customer

class Command(BaseCommand):
    help = 'Creates loyalty accounts for all customers'

    def handle(self, *args, **kwargs):
        # Get the active loyalty program
        try:
            program = LoyaltyProgram.objects.filter(is_active=True, target_audience='customer').first()
            if not program:
                self.stdout.write(self.style.ERROR('No active customer loyalty program found. Run setup_loyalty first.'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error fetching program: {e}'))
            return
        
        # Get the lowest tier (SILVER)
        default_tier = program.tiers.order_by('min_points').first()
        if not default_tier:
            self.stdout.write(self.style.WARNING('No tiers found for this program'))
            default_tier = None
        
        # Get all customers
        customers = Customer.objects.all()
        created_count = 0
        updated_count = 0
        
        for customer in customers:
            # Check if customer already has a loyalty account
            account, created = LoyaltyAccount.objects.get_or_create(
                customer=customer,
                defaults={
                    'program': program,
                    'balance': 0,
                    'lifetime_points': 0,
                    'current_tier': default_tier
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Created loyalty account for: {customer.name}'))
            else:
                # Update existing account to ensure it has the active program
                if not account.program or not account.program.is_active:
                    account.program = program
                    account.save()
                    updated_count += 1
                    self.stdout.write(self.style.WARNING(f'♻️  Updated program for: {customer.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Summary:'))
        self.stdout.write(self.style.SUCCESS(f'   - Created: {created_count} accounts'))
        self.stdout.write(self.style.SUCCESS(f'   - Updated: {updated_count} accounts'))
        self.stdout.write(self.style.SUCCESS(f'   - Total customers: {customers.count()}'))
