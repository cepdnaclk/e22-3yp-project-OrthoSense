from django.db import migrations, models


def clear_plaintext_tokens(apps, schema_editor):
    apps.get_model("devices", "DeviceCredential").objects.all().update(raw_token_display="")


class Migration(migrations.Migration):
    dependencies = [("devices", "0001_initial")]
    operations = [migrations.AddField(model_name="device", name="health_report", field=models.JSONField(default=dict, blank=True)), migrations.RunPython(clear_plaintext_tokens, migrations.RunPython.noop)]
