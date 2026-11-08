from django.contrib import admin

from apps.accounts.admin_support import ProjectModelAdmin
from apps.accounts.models import User
from .models import ExerciseDefinition, ExercisePrescription, PlanVersion


@admin.register(ExerciseDefinition)
class ExerciseDefinitionAdmin(ProjectModelAdmin):
    list_display = ("name", "code", "target_joint", "default_repetitions", "default_sets")
    search_fields = ("name", "code", "target_joint")
    readonly_fields = ("created_at",)


@admin.register(PlanVersion)
class PlanVersionAdmin(ProjectModelAdmin):
    list_display = ("patient", "version_number", "status", "authored_by", "published_at")
    list_filter = ("status",)
    search_fields = ("patient__email", "patient__full_name", "authored_by__full_name")
    autocomplete_fields = ("patient", "authored_by")
    readonly_fields = ("status", "published_at", "created_at", "updated_at")
    user_role_fields = {"patient": User.Role.PATIENT, "authored_by": User.Role.CLINICIAN}
    actions = None

    def has_change_permission(self, request, obj=None):
        return super().has_change_permission(request, obj) and (obj is None or obj.status == PlanVersion.Status.DRAFT)

    def has_delete_permission(self, request, obj=None):
        return super().has_delete_permission(request, obj) and (obj is None or obj.status == PlanVersion.Status.DRAFT)


@admin.register(ExercisePrescription)
class ExercisePrescriptionAdmin(ProjectModelAdmin):
    list_display = ("plan_version", "exercise", "target_repetitions", "target_sets", "order")
    search_fields = ("plan_version__patient__email", "exercise__name")
    autocomplete_fields = ("plan_version", "exercise")
    actions = None

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "plan_version":
            kwargs["queryset"] = PlanVersion.objects.filter(status=PlanVersion.Status.DRAFT)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_change_permission(self, request, obj=None):
        return super().has_change_permission(request, obj) and (obj is None or obj.plan_version.status == PlanVersion.Status.DRAFT)

    def has_delete_permission(self, request, obj=None):
        return super().has_delete_permission(request, obj) and (obj is None or obj.plan_version.status == PlanVersion.Status.DRAFT)
