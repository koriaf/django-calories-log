"""Settings provided by environment variables currently.

Provide settings by environment variables. Grep this file for NUTRICALC for the list.

By the way, I use 120 characters for pep8 line length.

"""
import os
from django.core.exceptions import ImproperlyConfigured


def env(name, default):
    """Get variable name and default value, return environment value or default one"""
    value = os.environ.get(name, default)
    if isinstance(default, bool):
        # it's boolean value, must be converted from string
        if not isinstance(value, bool):
            value = value.lower().strip()
            if value == 'true':
                value = True
            elif value == 'false':
                value = False
            else:
                raise ImproperlyConfigured(
                    "Value of boolean '{}' is {}, which not true and not false".format(
                        name, value
                    )
                )
    return value

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SECRET_KEY = env('NUTRICALC_SECRET_KEY', default='whocares')

DEBUG = env("NUTRICALC_DEBUG", default=True)

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    # base django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # local apps
    'nutricalc',
    'nutricalc.food',
    'nutricalc.backlog',
    'nutricalc.food_api_v1',

    # 3rd party apps
    'rest_framework',
    'rest_framework_swagger',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nutricalc.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nutricalc.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env('NUTRICALC_DB_NAME', default='nutricalc'),
        'HOST': env('NUTRICALC_DB_HOST', default='localhost'),
        'PORT': env('NUTRICALC_DB_PORT', default=''),
        'USER': env('NUTRICALC_DB_USERNAME', default='nutricalc'),
        'PASSWORD': env('NUTRICALC_DB_PASSWORD', default='nutricalc'),
        'ATOMIC_REQUESTS': True,
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True
USE_L10N = False
USE_TZ = True

STATIC_URL = '/static/'

SITE_ID = 1

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_LOGIN_ATTEMPTS_LIMIT = None
ACCOUNT_PASSWORD_MIN_LENGTH = 3  # we never store any personal data anyway
LOGIN_URL = '/accounts/login'
LOGIN_REDIRECT_URL = '/'
