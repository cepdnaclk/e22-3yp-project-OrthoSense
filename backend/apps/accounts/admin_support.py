from django.contrib import admin


class SuperuserOnlyAdminMixin:
    """Full database administration is separate from portal administrator access."""

    def has_module_permission(self, request):
        return request.user.is_superuser and super().has_module_permission(request)

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser and super().has_view_permission(request, obj)

    def has_add_permission(self, request):
        return request.user.is_superuser and super().has_add_permission(request)

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser and super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser and super().has_delete_permission(request, obj)


class ProjectModelAdmin(SuperuserOnlyAdminMixin, admin.ModelAdmin):
    """Limit user relation choices to the role appropriate to each record."""

    user_role_fields = {}

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        role = self.user_role_fields.get(db_field.name)
        if role:
            kwargs["queryset"] = db_field.remote_field.model.objects.filter(role=role)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class ReadOnlyProjectAdmin(ProjectModelAdmin):
    """Expose recorded evidence without adding or rewriting it through admin."""

    actions = None

    def get_readonly_fields(self, request, obj=None):
        return tuple(field.name for field in self.model._meta.concrete_fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
