from rest_framework import serializers
from .models import Customer, AttributeSet, Attribute
from django.db import connection

class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = '__all__'

class AttributeSetSerializer(serializers.ModelSerializer):
    attributes = AttributeSerializer(many=True, read_only=True)
    
    class Meta:
        model = AttributeSet
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    branch_name = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'loyalty_points', 'tier', 'company_uuid', 'is_email_verified', 'is_phone_verified', 'email_otp', 'phone_otp')

    def validate(self, data):
        phone = data.get('phone')
        email = data.get('email')
        request = self.context.get('request')
        company_uuid = getattr(request, 'company_uuid', None) if request else None
        instance = self.instance

        # 1. Phone Uniqueness within Company
        if phone and company_uuid:
            queryset = Customer.objects.filter(
                company_uuid=company_uuid,
                phone=phone,
                is_deleted=False
            )
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({"phone": "A customer with this phone number already exists in this company."})

        # 2. Email Uniqueness within Company
        if email and company_uuid:
            queryset = Customer.objects.filter(
                company_uuid=company_uuid,
                email=email,
                is_deleted=False
            )
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({"email": "A customer with this email already exists in this company."})
        
        return data

    def get_branch_name(self, obj):
        if not obj.branch_id:
            return "General"
        
        try:
            with connection.cursor() as cursor:
                # Check Wings (Branches) first
                cursor.execute("SELECT name FROM company.tenants_wing WHERE id = %s", [str(obj.branch_id)])
                row = cursor.fetchone()
                if row:
                    return f"{row[0]}"
                
                # Check Companies (Units/Groups)
                cursor.execute("SELECT name FROM company.tenants_company WHERE id = %s", [str(obj.branch_id)])
                row = cursor.fetchone()
                if row:
                    return f"{row[0]}"
        except Exception:
            return "Unknown"
            
        return "Unknown"
