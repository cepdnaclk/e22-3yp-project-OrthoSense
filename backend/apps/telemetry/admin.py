from django.contrib import admin

from apps.accounts.admin_support import ProjectModelAdmin, ReadOnlyProjectAdmin
from apps.accounts.models import User
from .models import ReviewNote, Session, TelemetryBatch


@admin.register(Session)
class SessionAdmin(ProjectModelAdmin):
    list_display = ("patient", "exercise_name", "started_at", "status", "quality_flag", "doctor_reviewed")
    list_filter = ("status", "quality_flag", "doctor_reviewed")
    search_fields = ("patient__email", "patient__full_name", "exercise_name", "device__device_identifier")
    autocomplete_fields = ("patient", "device", "plan_version")
    date_hierarchy = "started_at"
    user_role_fields = {"patient": User.Role.PATIENT}


@admin.register(TelemetryBatch)
class TelemetryBatchAdmin(ReadOnlyProjectAdmin):
    list_display = ("session", "device", "boot_id", "sequence_number", "sample_count", "server_received_at")
    search_fields = ("device__device_identifier", "session__patient__email", "boot_id")
    date_hierarchy = "server_received_at"


@admin.register(ReviewNote)
class ReviewNoteAdmin(ReadOnlyProjectAdmin):
    list_display = ("session", "clinician", "reviewed_at")
    search_fields = ("session__patient__email", "clinician__email", "content")
    date_hierarchy = "reviewed_at"
