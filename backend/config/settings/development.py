from .base import *

DEBUG = True

# Allow LAN access (e.g. 10.4.2.2 or local network testing) in development
ALLOWED_HOSTS = ["*"]

# Origins are explicit in base.py; add LAN origins through environment settings.
CORS_ALLOW_ALL_ORIGINS = False
