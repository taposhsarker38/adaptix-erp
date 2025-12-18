import pytest
import uuid
import json
from apps.quality.models import Inspection, QualityStandard, TestResult

@pytest.mark.django_db
class TestQualityLogic:
    def test_quality_standard_creation(self):
        """Verify Quality Standard creation"""
        product_id = uuid.uuid4()
        qs = QualityStandard.objects.create(
            product_uuid=product_id,
            name="ISO 9001",
            criteria=json.dumps({"safety": "high"}),
            tolerance_min=0.5,
            tolerance_max=1.5
        )
        assert qs.name == "ISO 9001"
        assert qs.product_uuid == product_id
        assert "safety" in qs.criteria

    def test_inspection_flow(self):
        """Verify Inspection creation and TestResult logging"""
        # Create Standard
        product_id = uuid.uuid4()
        qs = QualityStandard.objects.create(
            product_uuid=product_id,
            name="Check A", 
            criteria="check_integrity"
        )
        
        # Create Inspection
        ref_id = uuid.uuid4()
        inspection = Inspection.objects.create(
            reference_type="INVENTORY",
            reference_uuid=ref_id,
            inspector_id=1,
            status="PENDING"
        )
        assert inspection.status == "PENDING"
        
        # Create TestResult (simulate pass)
        result = TestResult.objects.create(
            inspection=inspection,
            standard=qs,
            measured_value=1.0,
            passed=True,
            notes="Looked good"
        )
        
        # Update Inspection status
        inspection.status = "PASSED"
        inspection.save()
        
        inspection.refresh_from_db()
        assert inspection.status == "PASSED"
        assert inspection.results.count() == 1
        assert inspection.results.first().passed is True
