import pytest
import uuid
from apps.alerts.models import Notification
from apps.emails.models import EmailTemplate, NotificationLog

@pytest.mark.django_db
class TestNotificationLogic:
    def test_create_read_notification(self):
        """Verify Notification creation and read status"""
        user_id = uuid.uuid4()
        
        # Create
        note = Notification.objects.create(
            user_id=user_id,
            title="Welcome",
            message="Welcome to Adapter!",
            type="info"
        )
        assert note.is_read is False
        assert str(note.user_id) == str(user_id)
        
        # Mark Read
        note.is_read = True
        note.save()
        
        note.refresh_from_db()
        assert note.is_read is True

    def test_email_template_rendering(self):
        """Verify Email Template creation (Rendering logic usually in service, testing model here)"""
        tpl = EmailTemplate.objects.create(
            code="user.welcome",
            subject="Welcome {name}",
            body="Hello {name}, thanks for joining!"
        )
        assert tpl.code == "user.welcome"
        
        # Basic simulation of rendering usage
        context = {"name": "Alice"}
        rendered_subject = tpl.subject.format(**context)
        rendered_body = tpl.body.format(**context)
        
        assert rendered_subject == "Welcome Alice"
        assert rendered_body == "Hello Alice, thanks for joining!"
        
    def test_notification_log(self):
        """Verify logging of sent emails"""
        log = NotificationLog.objects.create(
            recipient="test@example.com",
            subject="Test Subject",
            content="Body content",
            status="pending"
        )
        assert log.status == "pending"
        
        # Simulate Send
        log.status = "sent"
        log.save()
        assert log.status == "sent"
