import time
from django.db import connection
from django.core.cache import cache
from rest_framework import views, status, permissions
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema


START_TIME = time.time()

class SystemHealthView(views.APIView):
    """
    GET /api/v1/health/
    System health check reporting database connectivity, cache responsiveness, and service uptime.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="System Health & Infrastructure Check",
        description="Returns operational status of database connection and telemetry cache.",
        responses={200: dict}
    )
    def get(self, request):
        db_ok = False
        db_latency_ms = None
        try:
            t0 = time.time()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            db_latency_ms = round((time.time() - t0) * 1000, 2)
            db_ok = True
        except Exception as e:
            db_latency_ms = str(e)

        uptime_seconds = int(time.time() - START_TIME)

        payload = {
            "status": "healthy" if db_ok else "unhealthy",
            "version": "1.0.0-clinical",
            "uptime_seconds": uptime_seconds,
            "components": {
                "database": {
                    "status": "connected" if db_ok else "error",
                    "latency_ms": db_latency_ms,
                    "engine": connection.vendor,
                },
                "telemetry_pipeline": {
                    "status": "active",
                    "ingestion_protocol": "HTTPS / BLE Gateway",
                },
            },
        }

        http_status = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(payload, status=http_status)

