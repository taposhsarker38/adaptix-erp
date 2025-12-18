import pytest
import uuid
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def company_uuid():
    return str(uuid.uuid4())

@pytest.fixture
def user(db):
    try:
        return User.objects.create_user(
            email="test@example.com",
            password="password123",
            username="testuser",
            is_active=True
        )
    except Exception:
        # Fallback if custom user model differs
        return User.objects.create(username="testuser", email="test@example.com")

@pytest.fixture
def auth_client(api_client, user, company_uuid, settings):
    """Authenticated API Client with Company Context."""
    settings.DEBUG = True
    
    # Disable AuditMiddleware to avoid RabbitMQ connection errors during tests
    # HRMS uses 'config.middleware.AuditMiddleware'
    new_middleware = [
        m for m in settings.MIDDLEWARE 
        if m != 'config.middleware.AuditMiddleware'
    ]
    settings.MIDDLEWARE = new_middleware

    api_client.force_authenticate(user=user)
    api_client.credentials(HTTP_X_COMPANY_UUID=company_uuid)
    return api_client

@pytest.fixture
def mock_audit_middleware(settings):
    """
    Fixture to selectively ENABLE AuditMiddleware but Mock the publish_event function.
    Useful for testing the middleware logic itself without real RabbitMQ.
    """
    settings.DEBUG = True
    # Ensure AuditMiddleware is present for this test context
    if 'config.middleware.AuditMiddleware' not in settings.MIDDLEWARE:
         settings.MIDDLEWARE += ['config.middleware.AuditMiddleware']
    
    # Patch the messaging utility used by the middleware
    # config.middleware imports 'publish_event' from 'messaging' (or core)
    # in HRMS middleware.py: 'from .messaging import publish_event' OR 'from adaptix_core.middleware ...'
    
    # Let's inspect config/middleware.py content again to be sure where to patch.
    # It says: `from adaptix_core.middleware import JWTCompanyMiddleware, AuditMiddleware`
    # So we need to patch `adaptix_core.middleware.messaging.publish_event` or `adaptix_core.middleware.publish_event`
    
    with patch('adaptix_core.middleware.publish_event') as mock_pub:
        yield mock_pub
