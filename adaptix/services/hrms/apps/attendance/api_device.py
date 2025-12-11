from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import Attendance
from apps.employees.models import Employee
import logging

logger = logging.getLogger(__name__)

class DeviceSyncView(views.APIView):
    permission_classes = [permissions.AllowAny] # OR verify device via Secret Header

    def post(self, request):
        """
        Receive bulk attendance logs from Biometric Devices (ZKTeco/Hikvision Push)
        Expected payload:
        [
            {"device_id": "ZK001", "user_id": "EMP001", "timestamp": "2024-12-10 09:00:00", "status": "CheckIn"}
        ]
        """
        logs = request.data
        if not isinstance(logs, list):
            return Response({"error": "Expected list of logs"}, status=400)

        synced_count = 0
        errors = []

        for log in logs:
            try:
                emp_code = log.get('user_id')
                timestamp_str = log.get('timestamp')
                device_id = log.get('device_id')
                
                # Find Employee
                try:
                    employee = Employee.objects.get(employee_code=emp_code)
                except Employee.DoesNotExist:
                    errors.append(f"Employee {emp_code} not found")
                    continue

                # Parse Time
                # Assuming simple format for now, in prod use dateutil.parser
                # timestamp = dateutil.parser.parse(timestamp_str)
                # For this demo, we'll use current time if parsing fails or just rely on Django to cast if standard iso
                
                # Logic: Find or Create Attendance for that day
                # This is a simplified logic. Real-world needs timezone handling.
                dt = timezone.now() # Placeholder, should parse existing timestamp
                date = dt.date()
                time = dt.time()

                attendance, created = Attendance.objects.get_or_create(
                    employee=employee,
                    date=date,
                    defaults={'status': 'present', 'method': 'biometric', 'device_id': device_id}
                )

                # Update Check-in/out logic
                # If first record -> check_in
                # If last record -> check_out (simplified)
                if not attendance.check_in:
                    attendance.check_in = time
                    attendance.device_id = device_id
                    attendance.method = 'biometric'
                    attendance.save()
                    synced_count += 1
                elif attendance.check_in and not attendance.check_out and time > attendance.check_in:
                    attendance.check_out = time
                    attendance.save()
                    synced_count += 1
                
            except Exception as e:
                logger.error(f"Sync error: {str(e)}")
                errors.append(str(e))

        return Response({
            "message": "Sync complete",
            "synced": synced_count,
            "errors": errors
        })
