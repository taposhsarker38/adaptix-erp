from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from .nlp_engine import NLPEngine
from apps.financial_anomalies.models import FinancialAnomaly
from apps.automation.models import ActionLog
from apps.forecasts.models import Forecast
import logging

logger = logging.getLogger(__name__)

class IsJWTAuthenticated(BasePermission):
    """
    Allows access if JWTCompanyMiddleware successfully validated the token.
    """
    def has_permission(self, request, view):
        # Check if user_claims were populated by middleware
        return bool(getattr(request, 'user_claims', None))

class ChatView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def post(self, request):
        """
        Handle chat messages from the frontend assistant.
        Payload: { "message": "..." }
        """
        # Get Company UUID from request (Middleware adds this)
        if not hasattr(request, 'company_uuid'):
            # Fallback if middleware not active or superuser without company
            return Response({"error": "Company context missing"}, status=400)
            
        message = request.data.get("message", "")
        if not message:
            return Response({"error": "Message is required"}, status=400)

        engine = NLPEngine(company_uuid=request.company_uuid)
        response_data = engine.process_message(message)

        return Response(response_data)

class IntelligenceFeedView(APIView):
    permission_classes = [IsJWTAuthenticated]

    def get(self, request):
        company_uuid = getattr(request, 'company_uuid', None)
        if not company_uuid:
            return Response({"error": "Company context missing"}, status=400)

        # 1. Fetch Anomalies
        anomalies = FinancialAnomaly.objects.filter(company_uuid=company_uuid).order_by('-created_at')[:10]
        
        # 2. Fetch Automation logs
        automation_logs = ActionLog.objects.filter(rule__company_uuid=company_uuid).order_by('-executed_at')[:10]

        # 3. Fetch Forecast events (Aggregated by latest created_at)
        forecasts = Forecast.objects.filter(company_uuid=company_uuid).order_by('-created_at')[:10]

        feed_items = []

        for a in anomalies:
            severity_map = {
                'low': 'info',
                'medium': 'info',
                'high': 'warning',
                'critical': 'error'
            }
            feed_items.append({
                "id": f"anomaly-{a.id}",
                "type": "Anomaly",
                "message": f"Potential {a.get_anomaly_type_display()} detected: {a.reasoning[:100]}...",
                "timestamp": a.created_at,
                "severity": severity_map.get(a.severity, 'info')
            })

        for log in automation_logs:
            feed_items.append({
                "id": f"auto-{log.id}",
                "type": "Automation",
                "message": f"Workflow Rule '{log.rule.name}' triggered.",
                "timestamp": log.executed_at,
                "severity": "success" if log.status == 'success' else 'error'
            })

        # Forecasts don't have a direct "event" model, but we can treat recent generations as events
        # Unique products from recent forecasts
        seen_products = set()
        for f in forecasts:
            if f.product_uuid not in seen_products:
                feed_items.append({
                    "id": f"forecast-{f.id}",
                    "type": "Forecast",
                    "message": f"Demand Forecast updated for {f.product_name}.",
                    "timestamp": f.created_at,
                    "severity": "success"
                })
                seen_products.add(f.product_uuid)

        # Sort combined feed
        feed_items.sort(key=lambda x: x['timestamp'], reverse=True)

        return Response(feed_items[:50])
