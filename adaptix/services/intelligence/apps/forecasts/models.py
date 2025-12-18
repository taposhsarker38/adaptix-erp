from django.db import models

class SalesForecast(models.Model):
    company_uuid = models.UUIDField(null=True, blank=True)  # Nullable for existing data safety
    product_uuid = models.UUIDField(null=True, blank=True)
    forecast_type = models.CharField(max_length=50, default='sales')
    date = models.DateField()
    predicted_sales = models.FloatField()
    confidence_lower = models.FloatField(null=True)
    confidence_upper = models.FloatField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['company_uuid', 'product_uuid']),
            models.Index(fields=['date']),
        ]
        ordering = ['date']
