from django.contrib import admin

from apps.accounts.admin_support import ProjectModelAdmin
from apps.accounts.models import User
from .models import Device, DeviceAssignment, DeviceCredential, SensorChannel, TechnicalAlert


@admin.register(Device)
class DeviceAdmin(ProjectModelAdmin):
    list_display = ("device_identifier", "mac_address", "status", "firmware_version", "last_seen_at")
    list_filter = ("status", "firmware_version")
    search_fields = ("device_identifier", "mac_address")
    readonly_fields = ("created_at", "updated_at")


@admin.register(DeviceAssignment)
class DeviceAssignmentAdmin(ProjectModelAdmin):
    list_display = ("device", "patient", "active", "assigned_at", "assigned_by")
    list_filter = ("active",)
    search_fields = ("device__device_identifier", "patient__email", "patient__full_name")
    autocomplete_fields = ("device", "patient", "assigned_by")
    readonly_fields = ("assigned_at",)
    user_role_fields = {"patient": User.Role.PATIENT}


@admin.register(DeviceCredential)
class DeviceCredentialAdmin(ProjectModelAdmin):
    list_display = ("device", "is_revoked", "expires_at", "created_at")
    list_filter = ("is_revoked",)
    search_fields = ("device__device_identifier",)
    fields = ("device", "is_revoked", "expires_at", "created_at")
    readonly_fields = ("device", "created_at")

    def has_add_permission(self, request):
        # The provisioning API generates the token and its verification hash.
        return False


@admin.register(SensorChannel)
class SensorChannelAdmin(ProjectModelAdmin):
    list_display = ("device", "channel_index", "sensor_type", "label", "health_status", "sampling_rate_hz")
    list_filter = ("sensor_type", "health_status")
    search_fields = ("device__device_identifier", "label")
    autocomplete_fields = ("device",)


@admin.register(TechnicalAlert)
class TechnicalAlertAdmin(ProjectModelAdmin):
    list_display = ("device", "code", "severity", "message", "created_at", "resolved_at")
    list_filter = ("severity",)
    search_fields = ("device__device_identifier", "code", "message")
    autocomplete_fields = ("device",)
    readonly_fields = ("created_at",)
