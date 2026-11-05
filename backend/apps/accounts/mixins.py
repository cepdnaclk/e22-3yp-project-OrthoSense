from .models import User, ClinicianAssignment

class ScopedPatientQuerySetMixin:
    """
    Enforces tenant scoping across queries.
    - Clinicians only see rows belonging to their actively assigned patients.
    - Patients only see their own rows.
    - Administrators see all records for technical governance.
    """
    patient_field_lookup = "patient"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if not user or not user.is_authenticated:
            return qs.none()

        if user.role == User.Role.ADMIN:
            return qs

        if user.role == User.Role.PATIENT:
            val = user.id if self.patient_field_lookup in ["id", "pk"] else user
            filter_kwargs = {self.patient_field_lookup: val}
            return qs.filter(**filter_kwargs)

        if user.role == User.Role.CLINICIAN:
            assigned_patient_ids = ClinicianAssignment.objects.filter(
                clinician=user,
                active=True,
            ).values_list("patient_id", flat=True)
            filter_kwargs = {f"{self.patient_field_lookup}__in": assigned_patient_ids}
            return qs.filter(**filter_kwargs)

        return qs.none()
