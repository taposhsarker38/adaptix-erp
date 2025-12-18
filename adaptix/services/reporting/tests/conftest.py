import pytest
from rest_framework.test import APIClient
from decimal import Decimal

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture(autouse=True)
def mock_permissions(mocker):
    try:
        mocker.patch('rest_framework.permissions.IsAuthenticated.has_permission', return_value=True)
    except ImportError:
        pass
