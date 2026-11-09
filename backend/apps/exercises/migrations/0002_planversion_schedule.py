from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("exercises", "0001_initial")]
    operations = [migrations.AddField(model_name="planversion", name="schedule", field=models.JSONField(default=list, blank=True))]
