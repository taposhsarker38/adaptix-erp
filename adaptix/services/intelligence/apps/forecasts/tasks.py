from celery import shared_task
from django.db import connection
from .models import SalesHistory
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task(name="forecasts.sync_sales_history")
def sync_sales_history(company_uuid=None):
    """
    Summarizes POS orders into daily SalesHistory.
    """
    logger.info(f"Syncing sales history. Company: {company_uuid}")
    
    # We sync for the last 30 days to ensure any retroactive updates are captured
    sync_start_date = date.today() - timedelta(days=30)
    
    query = """
        SELECT 
            oi.product_uuid, 
            oi.product_name,
            o.company_uuid,
            o.created_at::date as sale_date,
            SUM(oi.quantity) as total_qty,
            SUM(oi.subtotal) as total_revenue
        FROM pos.sales_order o
        JOIN pos.sales_orderitem oi ON o.id = oi.order_id
        WHERE o.status = 'completed' 
        AND o.created_at >= %s
    """
    params = [sync_start_date]
    
    if company_uuid:
        query += " AND o.company_uuid = %s"
        params.append(str(company_uuid))
        
    query += " GROUP BY oi.product_uuid, oi.product_name, o.company_uuid, sale_date"
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            for row in rows:
                prod_id, prod_name, comp_id, sale_date, qty, revenue = row
                
                SalesHistory.objects.update_or_create(
                    product_uuid=prod_id,
                    date=sale_date,
                    company_uuid=comp_id,
                    defaults={
                        'product_name': prod_name,
                        'quantity_sold': qty,
                        'revenue': revenue
                    }
                )
        
        logger.info(f"Successfully synced {len(rows)} sales history records.")
        return f"Synced {len(rows)} records"
    except Exception as e:
        logger.error(f"Sync failed: {str(e)}")
        return f"Error: {str(e)}"
@shared_task(name="forecasts.run_forecasts")
def run_forecasts(company_uuid=None):
    """
    Generates 7-day predictions for all products with history.
    """
    logger.info(f"Running forecasts. Company: {company_uuid}")
    
    from .models import Forecast
    
    products_to_forecast = SalesHistory.objects.values('product_uuid', 'company_uuid', 'product_name').distinct()
    if company_uuid:
        products_to_forecast = products_to_forecast.filter(company_uuid=company_uuid)
        
    forecast_count = 0
    today = date.today()
    
    for p in products_to_forecast:
        prod_id = p['product_uuid']
        comp_id = p['company_uuid']
        name = p['product_name']
        
        # Advanced Forecasting: Linear Regression
        # We take available history to train a trend model
        history_data = SalesHistory.objects.filter(
            product_uuid=prod_id, 
            company_uuid=comp_id
        ).order_by('date')
        
        if history_data.count() < 2:
            logger.info(f"Skipping {name}: Only {history_data.count()} data points found.")
            continue # Need at least two data points for a trend
            
        import numpy as np
        from sklearn.linear_model import LinearRegression
        
        # Prepare data for Scikit-learn
        # X is days since the first sale in history, y is quantity
        start_date = history_data.first().date
        X = np.array([(item.date - start_date).days for item in history_data]).reshape(-1, 1)
        y = np.array([float(item.quantity_sold) for item in history_data])
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Calculate daily trend (slope)
        slope = model.coef_[0] if hasattr(model, 'coef_') else 0
        
        # Generate 7 days of forecast
        for i in range(1, 8):
            target_date = today + timedelta(days=i)
            days_since_start = (target_date - start_date).days
            
            # Prediction = model prediction
            predicted_qty = model.predict([[days_since_start]])[0]
            
            # Quality control: non-negative predictions, cap if crazy high
            predicted_qty = max(0, predicted_qty)
            
            Forecast.objects.update_or_create(
                product_uuid=prod_id,
                forecast_date=target_date,
                company_uuid=comp_id,
                defaults={
                    'product_name': name,
                    'predicted_quantity': round(float(predicted_qty), 2),
                    'confidence_score': 0.8 if history_data.count() > 14 else 0.6,
                    'algorithm_used': 'linear_regression'
                }
            )
            forecast_count += 1
            
    from .utils import publish_event
    publish_event(
        event_name="forecast.completed",
        data={"company_uuid": str(company_uuid) if company_uuid else None},
        rooms=[f"company_{company_uuid}"] if company_uuid else []
    )

    return f"Generated {forecast_count} forecasts"
