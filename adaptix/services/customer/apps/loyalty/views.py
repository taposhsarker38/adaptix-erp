from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from django.db import transaction
from .models import LoyaltyAccount, LoyaltyTransaction, LoyaltyProgram
from .serializers import LoyaltyAccountSerializer, LoyaltyTransactionSerializer
from adaptix_core.permissions import HasPermission

class LoyaltyAccountViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoyaltyAccount.objects.all()
    serializer_class = LoyaltyAccountSerializer
    permission_classes = [HasPermission]
    required_permission = "customer.view_loyalty"

    def get_queryset(self):
        # Filter by company from context (set by middleware)
        # Note: Middleware might need to inject company_uuid intorequest.
        # For now, we assume simple filtering if company_uuid is passed or available
        # In a real scenario, we'd filter by request.company_uuid
        return self.queryset

    @decorators.action(detail=True, methods=['post'], required_permission="customer.manage_loyalty")
    def adjust(self, request, pk=None):
        """Manual adjustment of points"""
        account = self.get_object()
        points = int(request.data.get('points', 0))
        reason = request.data.get('reason', 'Manual Adjustment')
        
        if points == 0:
            return Response({"error": "Points cannot be zero"}, status=400)
            
        with transaction.atomic():
            tx_type = 'earn' if points > 0 else 'adjust'
            LoyaltyTransaction.objects.create(
                account=account,
                transaction_type=tx_type,
                points=points,
                description=reason,
                created_by=getattr(request, 'user_id', 'admin')
            )
            account.balance += points
            if points > 0:
                account.lifetime_points += points
            account.save()
            
            # TODO: Trigger Tier Check logic here
            
        return Response(LoyaltyAccountSerializer(account).data)
