from datetime import timedelta
from django.contrib.auth import login, logout, authenticate
from django.utils import timezone
from rest_framework import views, viewsets, status, permissions
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import User, ClinicianAssignment, AuditLogEntry
from .serializers import (
    UserSerializer,
    PatientDetailSerializer,
    AuditLogSerializer,
    LoginRequestSerializer,
    AuthSessionResponseSerializer,
)
from .permissions import IsAdministrator, IsClinician, IsAssignedClinicianOrSelf
from .mixins import ScopedPatientQuerySetMixin


class LoginView(views.APIView):
    """
    POST /api/v1/auth/login/
    Validates user credentials, sets HttpOnly session cookies, and logs the login in the audit log.
    Supports password or demo role identification.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginRequestSerializer,
        responses={200: AuthSessionResponseSerializer},
        summary="User Authentication Login",
        description="Authenticates clinician, patient, or system admin and establishes an HttpOnly session."
    )
    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email_or_user = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data.get("password")
        role_hint = serializer.validated_data.get("role", "").upper()

        user = None
        # Try finding user by email or username
        if "@" in email_or_user:
            user = User.objects.filter(email__iexact=email_or_user).first()
        else:
            user = User.objects.filter(username__iexact=email_or_user).first()

        # If password provided, verify password
        if user and password:
            authenticated = authenticate(request, username=user.email, password=password)
            if not authenticated:
                return Response(
                    {"error": "Invalid email or password."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            user = authenticated
        elif not user:
            # Fallback for demo role switcher if user not found by exact string
            if "admin" in email_or_user or role_hint == "ADMIN":
                user = User.objects.filter(role=User.Role.ADMIN).first()
            elif "patient" in email_or_user or "sarah" in email_or_user or role_hint == "PATIENT":
                user = User.objects.filter(role=User.Role.PATIENT).first()
            else:
                user = User.objects.filter(role=User.Role.CLINICIAN).first()

        if not user or not user.is_active:
            return Response(
                {"error": "Account not found or inactive."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Establish Django HttpOnly session
        login(request, user)

        # Audit log entry
        AuditLogEntry.objects.create(
            actor=user,
            actor_name=user.full_name or user.email,
            actor_role=user.role,
            action="USER_LOGIN",
            target_type="auth",
            target_id=str(user.id),
            details=f"User {user.email} authenticated successfully via web portal.",
            severity="info",
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        expires_at = (timezone.now() + timedelta(days=1)).isoformat()
        token = f"session_token_{user.id}_{int(timezone.now().timestamp())}"

        response_data = {
            "user": UserSerializer(user).data,
            "token": token,
            "expiresAt": expires_at,
        }
        response = Response(response_data, status=status.HTTP_200_OK)
        # Set cookie
        response.set_cookie(
            key="orthosense_role",
            value=user.role.lower(),
            httponly=False,
            samesite="Lax",
        )
        return response


class LogoutView(views.APIView):
    """
    POST /api/v1/auth/logout/
    Flushes the active session record and removes auth cookies.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="User Logout", description="Terminates active session.")
    def post(self, request):
        if request.user.is_authenticated:
            AuditLogEntry.objects.create(
                actor=request.user,
                actor_name=request.user.full_name,
                actor_role=request.user.role,
                action="USER_LOGOUT",
                target_type="auth",
                target_id=str(request.user.id),
                details=f"User {request.user.email} logged out.",
                severity="info",
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        logout(request)
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie("orthosense_role")
        return response


class MeView(views.APIView):
    """
    GET /api/v1/auth/me/
    Returns current authenticated user profile, assigned doctor/device, and permissions.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: PatientDetailSerializer},
        summary="Current Authenticated User",
        description="Returns detailed profile and active role of the logged-in user."
    )
    def get(self, request):
        serializer = PatientDetailSerializer(request.user)
        return Response(serializer.data)


class PatientViewSet(ScopedPatientQuerySetMixin, viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/patients/
    GET /api/v1/patients/{id}/
    Returns patient records scoped to actively assigned clinician, or patient self.
    """
    queryset = User.objects.filter(role=User.Role.PATIENT).select_related(
        "patient_profile"
    ).prefetch_related("device_assignments__device")
    serializer_class = PatientDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAssignedClinicianOrSelf]
    patient_field_lookup = "id"


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/audit-log/
    Immutable security audit trail (Administrators only).
    """
    queryset = AuditLogEntry.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]

