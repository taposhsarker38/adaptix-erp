import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
class TestAuthFlow:
    
    def test_registration(self, api_client):
        """Verify user registration flow"""
        url = "/api/auth/register/" # Assuming this is the URL structure based on views
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "password123",
            "confirm_password": "password123"
        }
        response = api_client.post(url, data)
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Registration Failed: {response.data}")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['data']['username'] == "newuser"

    def test_login(self, api_client, create_user, user_data):
        """Verify login flow and token generation"""
        url = "/api/auth/login/"
        data = {
            "username": user_data['username'],
            "password": user_data['password']
        }
        response = api_client.post(url, data)
        if response.status_code != status.HTTP_200_OK:
            print(f"Login Failed: {response.data}")
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data['data']
        assert "refresh" in response.data['data']

    def test_verify_token(self, api_client, create_user, user_data):
        """Verify token validation endpoint"""
        # Login first to get token
        login_url = "/api/auth/login/"
        login_data = {
            "username": user_data['username'],
            "password": user_data['password']
        }
        login_resp = api_client.post(login_url, login_data)
        token = login_resp.data['data']['access']
        
        # Verify
        verify_url = "/api/auth/verify/"
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = api_client.get(verify_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['username'] == user_data['username']
