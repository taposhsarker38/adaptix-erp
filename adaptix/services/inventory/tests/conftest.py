import pytest
import uuid
from rest_framework.test import APIClient
from django.conf import settings

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def company_uuid():
    return str(uuid.uuid4())

@pytest.fixture
def auth_headers(company_uuid):
    return {
        "HTTP_X_COMPANY_UUID": company_uuid,
        "HTTP_AUTHORIZATION": "Bearer mock-token"
    }

@pytest.fixture(autouse=True)
def mock_settings(settings):
    settings.DEBUG = True

@pytest.fixture(autouse=True)
def mock_permissions(mocker):
    try:
        # Mocking specific service permission class
        mocker.patch('apps.utils.permissions.HasPermission.has_permission', return_value=True)
    except ImportError:
        pass
