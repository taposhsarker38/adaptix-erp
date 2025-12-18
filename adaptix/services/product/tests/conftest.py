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
    # Mocking JWT Middleware by passing company context via header in DEBUG mode
    # This assumes settings.DEBUG = True
    return {
        "HTTP_X_COMPANY_UUID": company_uuid,
        "HTTP_AUTHORIZATION": "Bearer mock-token"
    }

@pytest.fixture(autouse=True)
def mock_middleware_settings(settings):
    # Disable heavy middleware or unnecessary ones for unit/integration tests
    # Ensure DEBUG is True to allow header-based context injection if your middleware supports it
    settings.DEBUG = True
    
    # Mock databases or other settings if needed
    pass

@pytest.fixture(autouse=True)
def mock_permissions(mocker):
    # Mock HasPermission to always return True for tests
    try:
        mocker.patch('apps.products.permissions.HasPermission.has_permission', return_value=True)
        mocker.patch('rest_framework.permissions.IsAuthenticated.has_permission', return_value=True)
    except ImportError:
        pass
