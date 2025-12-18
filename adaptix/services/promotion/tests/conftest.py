import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture(autouse=True)
def mock_permissions(mocker):
    try:
        # Check if service has specific permissions, otherwise mock core
        # Based on file inspection earlier, we generally use config.base_views or core
        # We'll try to mock both likely candidates
        mocker.patch('rest_framework.permissions.IsAuthenticated.has_permission', return_value=True)
        # We will assume config.base_permissions or adaptix_core if needed.
        # For now, IsAuthenticated is the main one.
    except ImportError:
        pass
