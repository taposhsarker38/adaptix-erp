from django.db import models

class InventoryOptimization(models.Model):
    company_uuid = models.UUIDField(null=True, blank=True)
    product_uuid = models.UUIDField()
    branch_id = models.UUIDField(null=True, blank=True)
    current_stock = models.IntegerField()
    avg_daily_consumption = models.FloatField()
    suggested_reorder_point = models.IntegerField()
    suggested_reorder_qty = models.IntegerField()
    stockout_risk_score = models.FloatField(default=0.0)  # 0 to 100
    estimated_stockout_date = models.DateField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['company_uuid', 'product_uuid', 'branch_id']),
        ]
        verbose_name_plural = "Inventory Optimizations"
