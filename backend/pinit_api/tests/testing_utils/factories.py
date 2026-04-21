import factory
import random
from datetime import date
from pinit_api.models import User, Account, Pin, Board
from django.utils.text import slugify


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    class Params:
        # An optional random_sequence that can be passed by the AccountFactory below,
        # to create consistency between the account's username and its owner's email address
        random_sequence = None

    email = factory.LazyAttribute(
        lambda o: f"user_{o.random_sequence if o.random_sequence else '%06d' % random.randint(0, 99999999)}@example.com"
    )
    birthdate = date(1990, 1, 1)
    is_admin = False


class AccountFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Account

    class Params:
        random_sequence = factory.LazyAttribute(
            lambda _: "%06d" % random.randint(0, 99999999)
        )
        custom_username = None

    username = factory.Maybe(
        "custom_username",
        yes_declaration=factory.SelfAttribute("custom_username"),
        no_declaration=factory.LazyAttribute(lambda o: f"user_{o.random_sequence}"),
    )
    type = "personal"
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    initial = factory.LazyAttribute(lambda account: account.first_name[0].upper())
    profile_picture_url = factory.Faker("image_url")
    description = factory.Faker("sentence")
    owner = factory.SubFactory(
        UserFactory, random_sequence=factory.SelfAttribute("..random_sequence")
    )


class PinFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Pin

    title = factory.Faker("sentence", nb_words=5, variable_nb_words=True)
    description = factory.Faker("text")
    image_url = factory.Faker("image_url")
    author = factory.SubFactory(AccountFactory)


class BoardFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Board

    name = factory.Faker("sentence", nb_words=4)
    slug = factory.LazyAttribute(lambda o: slugify(o.name))
    author = factory.LazyAttribute(
        lambda o: (
            o.factory_parent.author
            if hasattr(o.factory_parent, "author")
            else AccountFactory()
        )
    )
