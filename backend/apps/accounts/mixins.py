from .models import User, ClinicianAssignment

class ScopedPatientQuerySetMixin:
    """
    Enforces tenant scoping across queries.
    - Clinicians only see rows belonging to their actively assigned patients.
    - Patients only see their own rows.
    - Administrators may access explicitly enabled user-directory metadata only.
    """
    patient_field_lookup = "patient"
    allow_admin_metadata = False

    def get_queryset(self):
        qs = super().get_queryset()
        for field in ("status",):
            value = self.request.query_params.get(field)
            if value and any(item.name == field for item in qs.model._meta.fields):
                qs = qs.filter(**{field: value})
        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            from uuid import UUID
            from rest_framework.exceptions import ValidationError
            try:
                patient_id = UUID(patient_id)
            except ValueError:
                raise ValidationError({"patient_id": "A valid UUID is required."})
            qs = qs.filter(**{self.patient_field_lookup: patient_id})
        user = self.request.user

        if not user or not user.is_authenticated:
            return qs.none()

        if user.role == User.Role.ADMIN:
            return qs if self.allow_admin_metadata else qs.none()

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
