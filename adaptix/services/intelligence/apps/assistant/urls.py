from django.urls import path
from .views import ChatView, IntelligenceFeedView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='assistant-chat'),
    path('feed/', IntelligenceFeedView.as_view(), name='intelligence-feed'),
]
