import pytest
from rest_framework.test import APIClient
import uuid

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture(autouse=True)
def mock_permissions(mocker):
    try:
        mocker.patch('rest_framework.permissions.IsAuthenticated.has_permission', return_value=True)
        mocker.patch('apps.utils.permissions.HasPermission.has_permission', return_value=True)
        # Mock Notification Service
        mocker.patch('apps.utils.notifications.NotificationService.send_notification')
    except ImportError:
        pass
        pass

@pytest.fixture
def company_uuid():
    return uuid.uuid4()
