from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm, UsernameField

from .admin_support import ProjectModelAdmin, ReadOnlyProjectAdmin, SuperuserOnlyAdminMixin
from .models import AuditLogEntry, ClinicianAssignment, ClinicianProfile, PatientProfile, User


class PortalUserCreationForm(UserCreationForm):
    # The model permits NULL usernames; the built-in UsernameField needs a string.
    username = UsernameField(required=False, empty_value="", max_length=150)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("email", "username", "full_name", "role", "department")

    def clean_email(self):
        email = User.objects.normalize_email(self.cleaned_data["email"].strip()).lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email


class PortalUserChangeForm(UserChangeForm):
    username = UsernameField(required=False, empty_value="", max_length=150)

    class Meta(UserChangeForm.Meta):
        model = User

    def clean_email(self):
        email = User.objects.normalize_email(self.cleaned_data["email"].strip()).lower()
        if User.objects.filter(email__iexact=email).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email


@admin.register(User)
class UserAdmin(SuperuserOnlyAdminMixin, DjangoUserAdmin):
    add_form = PortalUserCreationForm
    form = PortalUserChangeForm
    list_display = ("email", "full_name", "role", "is_active", "is_staff", "is_superuser")
    list_filter = ("role", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username", "full_name", "department")
    ordering = ("email",)
    readonly_fields = ("last_login", "date_joined", "created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Profile", {"fields": ("full_name", "first_name", "last_name", "role", "department")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "username", "full_name", "role", "department", "password1", "password2")}),
    )


@admin.register(PatientProfile)
class PatientProfileAdmin(ProjectModelAdmin):
    list_display = ("user", "diagnosis", "surgery_date", "recovery_week")
    search_fields = ("user__email", "user__full_name", "diagnosis")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")
    user_role_fields = {"user": User.Role.PATIENT}


@admin.register(ClinicianProfile)
class ClinicianProfileAdmin(ProjectModelAdmin):
    list_display = ("user", "license_number", "specialization", "hospital_affiliation")
    search_fields = ("user__email", "user__full_name", "license_number", "specialization")
    autocomplete_fields = ("user",)
    readonly_fields = ("created_at",)
    user_role_fields = {"user": User.Role.CLINICIAN}


@admin.register(ClinicianAssignment)
class ClinicianAssignmentAdmin(ProjectModelAdmin):
    list_display = ("clinician", "patient", "active", "assigned_at", "assigned_by")
    list_filter = ("active",)
    search_fields = ("clinician__email", "clinician__full_name", "patient__email", "patient__full_name")
    autocomplete_fields = ("clinician", "patient", "assigned_by")
    readonly_fields = ("assigned_at",)
    user_role_fields = {"clinician": User.Role.CLINICIAN, "patient": User.Role.PATIENT}


@admin.register(AuditLogEntry)
class AuditLogEntryAdmin(ReadOnlyProjectAdmin):
    list_display = ("timestamp", "actor_name", "actor_role", "action", "severity")
    list_filter = ("actor_role", "action", "severity")
    search_fields = ("actor_name", "action", "target_id", "details")
    date_hierarchy = "timestamp"


admin.site.site_header = "OrthoSense administration"
admin.site.site_title = "OrthoSense admin"
admin.site.index_title = "Project records"
