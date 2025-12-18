import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_data():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }

@pytest.fixture
def create_user(db, user_data):
    User = get_user_model()
    user = User.objects.create_user(**user_data)
    user.email_verified = True # Skip email verification for login tests
    user.is_active = True
    user.save()
    return user
