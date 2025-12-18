import pandas as pd
from prophet import Prophet
from celery import shared_task
from django.db import connection
from .models import SalesForecast
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@shared_task(name="forecasts.generate_sales_forecast")
def generate_sales_forecast(company_uuid=None, product_uuid=None):
    """
    Background task to generate sales forecasts using Prophet.
    If company_uuid is provided, forecasts only for that company.
    If product_uuid is provided, forecasts only for that product.
    """
    logger.info(f"Starting sales forecast generation. Company: {company_uuid}, Product: {product_uuid}")
    
    # Base query: Join orders and items for product-level daily sales
    query = """
        SELECT o.company_uuid, oi.product_uuid, o.created_at as ds, oi.subtotal as y
        FROM pos.sales_order o
        JOIN pos.sales_orderitem oi ON o.id = oi.order_id
        WHERE o.status != 'cancelled' AND o.is_deleted = false AND oi.is_deleted = false
    """
    params = []
    
    if company_uuid:
        query += " AND o.company_uuid = %s"
        params.append(str(company_uuid))
    
    if product_uuid:
        query += " AND oi.product_uuid = %s"
        params.append(str(product_uuid))

    try:
        df = pd.read_sql(query, connection, params=params)
        
        if df.empty:
            logger.warning("No sales data found for forecasting.")
            return "No data"

        # Preprocess
        df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)
        
        # We group by company and product to generate granular forecasts
        group_cols = ['company_uuid', 'product_uuid']
        results_count = 0

        # Iterate over each group (Company + Product)
        for name, group in df.groupby(group_cols):
            comp_id, prod_id = name
            
            # Aggregate by day for this specific group
            group_daily = group.set_index('ds').resample('D')['y'].sum().reset_index()
            
            if len(group_daily) < 2:
                logger.info(f"Skipping group {name}: Not enough data (need at least 2 days)")
                continue
            
            # Train Prophet
            m = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
            m.fit(group_daily)
            
            # Predict next 30 days
            future = m.make_future_dataframe(periods=30)
            forecast = m.predict(future)
            
            # Filter for the future 30 days
            last_30 = forecast.tail(30)
            
            # Update DB for this specific product/company
            # First, clear old ones for this specific slice
            SalesForecast.objects.filter(
                company_uuid=comp_id, 
                product_uuid=prod_id,
                forecast_type='sales'
            ).delete()
            
            forecast_objects = []
            for _, row in last_30.iterrows():
                forecast_objects.append(SalesForecast(
                    company_uuid=comp_id,
                    product_uuid=prod_id,
                    forecast_type='sales',
                    date=row['ds'].date(),
                    predicted_sales=row['yhat'],
                    confidence_lower=row['yhat_lower'],
                    confidence_upper=row['yhat_upper']
                ))
            
            SalesForecast.objects.bulk_create(forecast_objects)
            results_count += 30
            
        logger.info(f"Successfully generated {results_count} forecast data points.")
        return f"Generated {results_count} points"

    except Exception as e:
        logger.error(f"Forecasting task failed: {str(e)}")
        return f"Error: {str(e)}"
