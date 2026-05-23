from django.apps import AppConfig


class PinitApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pinit_api"
    label = "pinit_api"

    def ready(self):
        # Import signals module so @receiver decorators are registered.
        import pinit_api.signals  # noqa: F401
