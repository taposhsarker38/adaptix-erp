from django.core.management.base import BaseCommand
from apps.accounts.models import Permission

class Command(BaseCommand):
    help = 'Initialize default permissions'

    def handle(self, *args, **options):
        # A comprehensive list of permissions likely needed by other services
        perms = [
            # Product Service
            "view_product", "create_product", "update_product", "delete_product",
            "view_category", "create_category", "update_category", "delete_category",
            "view_brand", "create_brand", "update_brand", "delete_brand",
            "view_unit", "create_unit", "update_unit", "delete_unit",
            "view_attribute", "create_attribute", "update_attribute", "delete_attribute",
            
            # Inventory Service
            "view_stock", "create_stock", "update_stock", "delete_stock",
            "view_inventory", "view_warehouse", "create_warehouse",
            
            # Company Service (Tenants)
            "view_company", "update_company",
            "view_employee", "create_employee", "update_employee", "delete_employee",
            
            # Auth
            "view_user", "create_user", "update_user", "delete_user",
            "view_role", "create_role", "update_role", "delete_role",
            
            # POS
            "view_order", "create_order", "update_order", "delete_order",
            "view_pos_session", "create_pos_session", "close_pos_session",
            "sales.order", "sales.payment", "sales.session", 
            
            # Purchase
            "view_purchase_order", "create_purchase_order", "update_purchase_order", "delete_purchase_order",
            "view_vendor", "create_vendor", "update_vendor", "delete_vendor",

            # Accounting
            "view_account", "create_account", "update_account", "delete_account",
            "view_journal", "create_journal", "view_ledger",
            
            # Asset
            "view_asset", "create_asset", "update_asset", "delete_asset",
            "view_asset_maintenance", "create_asset_maintenance",
            
            # Customer (CRM)
            "view_customer", "create_customer", "update_customer", "delete_customer",
            "view_customer_tier", "update_customer_tier",
            
            # HRMS
            "view_attendance", "create_attendance", "view_payroll", "create_payroll",
            "view_shift", "create_shift", "update_shift",
            
            # Intelligence
            "view_forecast", "run_forecast",
            "view_automation", "trigger_automation",
            
            # Logistics
            "view_shipment", "create_shipment", "update_shipment", "delete_shipment",
            
            # Notification
            "view_notification", "create_notification", "send_notification",
            "view_alert_rule", "create_alert_rule",
            
            # Payment
            "view_payment", "create_payment", "process_payment", "refund_payment",
            
            # Promotion
            "view_promotion", "create_promotion", "update_promotion", "delete_promotion",
            "view_coupon", "create_coupon",
            
            # Quality
            "view_quality_check", "create_quality_check", "update_quality_check",
            "view_test_plan", "create_test_plan",
            
            # Reporting
            "view_report", "generate_report", "export_report",
        ]
        
        created_count = 0
        for codename in perms:
            obj, created = Permission.objects.get_or_create(
                codename=codename, 
                defaults={"name": codename.replace("_", " ").title()}
            )
            if created:
                created_count += 1
            
        self.stdout.write(self.style.SUCCESS(f'Successfully initialized {created_count} new permissions (Total: {len(perms)})'))
