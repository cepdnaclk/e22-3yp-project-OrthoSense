import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

@pytest.mark.parametrize("role", ["admin", "doc_a", "pat_a"])
def test_jwt_cookies_refresh_rotation_and_revocation(seed_environment, role):
    client = APIClient(enforce_csrf_checks=True)
    csrf = client.get("/api/v1/auth/csrf/").data["csrfToken"]
    result = client.post("/api/v1/auth/login/", {"email": seed_environment[role].email, "password": "password123"}, format="json", HTTP_X_CSRFTOKEN=csrf)
    assert result.status_code == 200
    csrf = result.data["csrfToken"]
    access = client.cookies["orthosense_access"].value
    old_refresh = client.cookies["orthosense_refresh"].value
    assert client.cookies["orthosense_access"]["httponly"]
    assert client.cookies["orthosense_refresh"]["httponly"]
    assert str(AccessToken(access)["user_id"]) == str(seed_environment[role].pk)
    assert client.get("/api/v1/auth/me/").status_code == 200
    from datetime import timedelta
    expired = AccessToken(access)
    expired.set_exp(lifetime=timedelta(seconds=-1))
    client.cookies["orthosense_access"] = str(expired)
    assert client.get("/api/v1/auth/me/").status_code == 401
    assert client.post("/api/v1/auth/refresh/").status_code == 403
    assert client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=csrf).status_code == 200
    client.cookies["orthosense_refresh"] = old_refresh
    assert client.post("/api/v1/auth/refresh/", HTTP_X_CSRFTOKEN=csrf).status_code == 401
    assert client.post("/api/v1/auth/logout/", HTTP_X_CSRFTOKEN=csrf).status_code == 200
    client.cookies["orthosense_access"] = access
    assert client.get("/api/v1/auth/me/").status_code == 401


def test_session_cookie_alone_is_not_portal_auth(seed_environment):
    client = APIClient()
    client.force_login(seed_environment["admin"])
    assert client.get("/api/v1/auth/me/").status_code == 401
    client.cookies["orthosense_access"] = "tampered.jwt.value"
    assert client.get("/api/v1/auth/me/").status_code == 401
