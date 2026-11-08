from django.contrib.auth import login, logout, authenticate
from django.middleware.csrf import get_token
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
from .authentication import BrowserSessionAuthentication, set_token_cookies, validate_token_session


class CsrfTokenView(views.APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        response = Response({"csrfToken": get_token(request._request)})
        response["Cache-Control"] = "no-store"
        return response


class LoginView(views.APIView):
    """
    POST /api/v1/auth/login/
    Validates user credentials, sets HttpOnly session cookies, and logs the login in the audit log.
    Requires valid credentials, including for demonstration accounts.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(
        request=LoginRequestSerializer,
        responses={200: AuthSessionResponseSerializer},
        summary="User Authentication Login",
        description="Authenticates clinician, patient, or system admin and establishes an HttpOnly session."
    )
    def post(self, request):
        # Anonymous logins must also be protected against login CSRF.
        BrowserSessionAuthentication().enforce_csrf(request)
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email_or_user = (
            serializer.validated_data.get("email")
            or serializer.validated_data.get("username")
            or ""
        ).strip().lower()
        password = serializer.validated_data.get("password")
        # Try finding user by email or username
        if "@" in email_or_user:
            user = User.objects.filter(email__iexact=email_or_user).first()
        else:
            user = User.objects.filter(username__iexact=email_or_user).first()

        # If password provided, verify password
        user = authenticate(
            request, username=user.email if user else email_or_user, password=password,
        )

        if not user or not user.is_active or user.role not in User.Role.values:
            return Response(
                {"error": "Invalid email or password."},
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

        expires_at = request.session.get_expiry_date().isoformat()

        response_data = {
            "user": UserSerializer(user).data,
            "csrfToken": get_token(request._request),
            "expiresAt": expires_at,
        }
        response = Response(response_data, status=status.HTTP_200_OK)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        refresh["sid"] = request.session.session_key
        request.session["refresh_jti"] = refresh["jti"]
        request.session.save()
        set_token_cookies(response, refresh.access_token, refresh)
        response["Cache-Control"] = "no-store"
        response.delete_cookie("orthosense_role")
        return response


class LogoutView(views.APIView):
    authentication_classes = []
    """
    POST /api/v1/auth/logout/
    Flushes the active session record and removes auth cookies.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(summary="User Logout", description="Terminates active session.")
    def post(self, request):
        BrowserSessionAuthentication().enforce_csrf(request)
        from django.contrib.auth import get_user
        request.user = get_user(request._request)
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
        response.delete_cookie("orthosense_access", path="/api/v1/")
        response.delete_cookie("orthosense_refresh", path="/api/v1/")
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
        serializer_class = PatientDetailSerializer if request.user.role == User.Role.PATIENT else UserSerializer
        response = Response(serializer_class(User.objects.get(pk=request.user.pk)).data)
        response["Cache-Control"] = "no-store"
        return response

    def patch(self, request):
        from django.db import transaction
        from .serializers import PatientPreferencesUpdateSerializer
        from .models import PatientProfile
        if request.user.role != User.Role.PATIENT:
            return Response({"detail": "Patient profile access only."}, status=403)
        serializer = PatientPreferencesUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = dict(serializer.validated_data)
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=request.user.pk)
            profile = PatientProfile.objects.select_for_update().filter(user=user).first()
            personal = {key: value for key, value in values.items() if key != "full_name"}
            if personal and profile is None:
                return Response({"detail": "Ask your clinician to create your patient profile before updating preferences."}, status=400)
            if "full_name" in values:
                user.full_name = values["full_name"]
                user.save(update_fields=["full_name", "updated_at"])
            if personal:
                for key, value in personal.items():
                    setattr(profile, key, value)
                profile.save(update_fields=[*personal, "updated_at"])
            AuditLogEntry.objects.create(actor=user, actor_name=user.full_name, actor_role=user.role,
                action="PATIENT_PROFILE_UPDATED", target_type="user", target_id=str(user.pk),
                details="Patient updated personal profile/preferences.")
        response = Response(PatientDetailSerializer(user).data)
        response["Cache-Control"] = "no-store"
        return response


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
    allow_admin_metadata = True

    def get_serializer_class(self):
        if self.request.user.role == User.Role.ADMIN:
            return UserSerializer
        return PatientDetailSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/audit-log/
    Immutable security audit trail (Administrators only).
    """
    queryset = AuditLogEntry.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdministrator]



class RefreshView(views.APIView):
    def get_authenticate_header(self, request):
        return "Bearer"

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework_simplejwt.exceptions import TokenError
        from rest_framework.exceptions import AuthenticationFailed
        BrowserSessionAuthentication().enforce_csrf(request)
        try:
            old = RefreshToken(request.COOKIES.get("orthosense_refresh", ""))
        except TokenError:
            raise AuthenticationFailed("Refresh token expired or invalid.")
        user = User.objects.filter(pk=old["user_id"], is_active=True).first()
        if not user:
            raise AuthenticationFailed("Account unavailable.")
        session = validate_token_session(old, user)
        if session.get("refresh_jti") != old["jti"]:
            raise AuthenticationFailed("Refresh token already used.")
        new = RefreshToken.for_user(user)
        new["sid"] = old["sid"]
        session["refresh_jti"] = new["jti"]
        session.save()
        response = Response({"detail": "Token refreshed."})
        response["Cache-Control"] = "no-store"
        set_token_cookies(response, new.access_token, new)
        return response
