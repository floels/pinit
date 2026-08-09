from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pinit_api", "0033_refreshtoken"),
    ]

    operations = [
        migrations.AddField(
            model_name="pin",
            name="image_height",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="pin",
            name="image_width",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
