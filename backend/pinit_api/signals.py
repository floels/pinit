from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Pin
from .elasticsearch_client import index_pin, delete_pin


@receiver(post_save, sender=Pin)
def on_pin_saved(sender, instance, **kwargs):
    index_pin(instance)


@receiver(post_delete, sender=Pin)
def on_pin_deleted(sender, instance, **kwargs):
    delete_pin(instance.unique_id)
