from rest_framework import permissions
from .models import User, ClinicianAssignment


class IsClinicalUser(permissions.BasePermission):
    """Technical administrator and hardware identities do not grant clinical access."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    request.user.role in (User.Role.CLINICIAN, User.Role.PATIENT))


def can_access_patient(user, patient):
    if user.role == User.Role.PATIENT:
        return user.pk == patient.pk
    return user.role == User.Role.CLINICIAN and ClinicianAssignment.objects.filter(
        clinician=user, patient=patient, active=True,
    ).exists()


class IsAdministrator(permissions.BasePermission):
    """Allows access only to authenticated system administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class IsClinician(permissions.BasePermission):
    """Allows access only to authenticated clinicians / orthopedic doctors."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.CLINICIAN
        )


class IsPatient(permissions.BasePermission):
    """Allows access only to authenticated patients."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.PATIENT
        )


class IsAssignedClinicianOrSelf(permissions.BasePermission):
    """
    Authorizes a clinician with an active assignment to the patient, or the patient themselves.
    Denies access to unrelated clinicians and non-administrative staff.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Only user-directory metadata is available to technical admins.
        if request.user.role == User.Role.ADMIN:
            return isinstance(obj, User)

        # Resolve target patient user instance
        target_patient_user = None
        if isinstance(obj, User):
            target_patient_user = obj
        elif hasattr(obj, "patient"):
            target_patient_user = obj.patient
        elif hasattr(obj, "user") and hasattr(obj.user, "patient_profile"):
            target_patient_user = obj.user

        if not target_patient_user:
            return False

        # Patient self-access
        if request.user.id == target_patient_user.id:
            return True

        # Clinician with active assignment
        if request.user.role == User.Role.CLINICIAN:
            return ClinicianAssignment.objects.filter(
                clinician=request.user,
                patient=target_patient_user,
                active=True,
            ).exists()

        return False

