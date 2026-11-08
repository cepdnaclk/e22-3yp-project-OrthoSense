from rest_framework.authentication import SessionAuthentication


class BrowserSessionAuthentication(SessionAuthentication):
    """Cookie authentication with DRF's CSRF enforcement and explicit 401s."""

    def authenticate_header(self, request):
        return "Session"



from rest_framework_simplejwt.authentication import JWTAuthentication


class PortalJWTAuthentication(JWTAuthentication):
    """JWT portal cookies with CSRF and server-side token-family revocation."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("orthosense_access")
        if not raw_token:
            return None
        token = self.get_validated_token(raw_token)
        user = self.get_user(token)
        validate_token_session(token, user)
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            BrowserSessionAuthentication().enforce_csrf(request)
        return user, token


def validate_token_session(token, user):
    from django.contrib.sessions.backends.db import SessionStore
    from django.utils.crypto import constant_time_compare
    from rest_framework.exceptions import AuthenticationFailed
    session = SessionStore(session_key=token.get("sid", ""))
    if (str(session.get("_auth_user_id")) != str(user.pk) or
            not constant_time_compare(session.get("_auth_user_hash", ""), user.get_session_auth_hash())):
        raise AuthenticationFailed("Token session expired or revoked.")
    return session


def set_token_cookies(response, access, refresh=None):
    from django.conf import settings
    options = {"httponly": True, "secure": settings.SESSION_COOKIE_SECURE, "samesite": "Lax", "path": "/api/v1/"}
    response.set_cookie("orthosense_access", str(access), max_age=900, **options)
    if refresh is not None:
        response.set_cookie("orthosense_refresh", str(refresh), max_age=86400, **options)
