from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem, RFQ, VendorQuote, AIProcurementSuggestion

class AIProcurementSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIProcurementSuggestion
        fields = '__all__'
        read_only_fields = ('company_uuid',)

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'
        read_only_fields = ('order', 'company_uuid')

from apps.vendors.serializers import VendorSerializer
from apps.vendors.models import Vendor

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, required=False)
    vendor = VendorSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), source='vendor', write_only=True
    )

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ('company_uuid', 'reference_number', 'total_amount', 'paid_amount')

    def _calculate_total(self, order):
        total = 0
        for item in order.items.all():
            total += (item.quantity * item.unit_cost) + item.tax_amount
        order.total_amount = total
        order.save()

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        # Generate reference number logic later or pass from frontend
        # For now simple auto-gen placeholder
        import uuid
        if 'reference_number' not in validated_data:
            validated_data['reference_number'] = str(uuid.uuid4())[:10].upper()
        
        order = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            PurchaseOrderItem.objects.create(order=order, **item_data, company_uuid=order.company_uuid)
            
        self._calculate_total(order)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update Order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update Items
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                PurchaseOrderItem.objects.create(
                    order=instance, 
                    company_uuid=instance.company_uuid,
                    **item_data
                )
            # Re-calculate total after item updates
            self._calculate_total(instance)
                
        return instance

class VendorQuoteSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    rfq_title = serializers.CharField(source='rfq.title', read_only=True)
    
    class Meta:
        model = VendorQuote
        fields = '__all__'
        read_only_fields = ('company_uuid', 'is_winning_quote')

class RFQSerializer(serializers.ModelSerializer):
    quotes = VendorQuoteSerializer(many=True, read_only=True)
    
    class Meta:
        model = RFQ
        fields = '__all__'
        read_only_fields = ('company_uuid', 'status', 'selected_quote')
