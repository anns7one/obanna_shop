import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _register_payload(**overrides) -> dict:
    payload = {
        "email": "anna@example.com",
        "password": "Password1",
        "confirmPassword": "Password1",
        "firstName": "Anna",
        "lastName": "Ivanova",
    }
    payload.update(overrides)
    return payload


async def test_register_creates_user_and_returns_token(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json=_register_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["user"]["email"] == "anna@example.com"
    assert "passwordHash" not in body["user"]
    assert "accessToken" in body
    assert "refresh_token" in response.cookies


async def test_register_rejects_duplicate_email(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())
    response = await client.post("/api/v1/auth/register", json=_register_payload())

    assert response.status_code == 409


async def test_register_rejects_weak_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json=_register_payload(password="weak", confirmPassword="weak"),
    )

    assert response.status_code == 422


async def test_register_rejects_mismatched_passwords(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json=_register_payload(confirmPassword="Different1"),
    )

    assert response.status_code == 422


async def test_login_success(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())
    response = await client.post(
        "/api/v1/auth/login", json={"email": "anna@example.com", "password": "Password1"}
    )

    assert response.status_code == 200
    assert "accessToken" in response.json()


async def test_login_wrong_password_is_rejected(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())
    response = await client.post(
        "/api/v1/auth/login", json={"email": "anna@example.com", "password": "WrongPass1"}
    )

    assert response.status_code == 401


async def test_login_unknown_email_gives_same_error_as_wrong_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "WrongPass1"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


async def test_me_requires_a_token(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401


async def test_me_returns_current_user(client: AsyncClient):
    register_response = await client.post("/api/v1/auth/register", json=_register_payload())
    token = register_response.json()["accessToken"]

    response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "anna@example.com"


async def test_update_me_changes_name_but_not_email(client: AsyncClient):
    register_response = await client.post("/api/v1/auth/register", json=_register_payload())
    token = register_response.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.patch(
        "/api/v1/auth/me", json={"firstName": "Anya", "lastName": "Petrova"}, headers=headers
    )

    assert response.status_code == 200
    body = response.json()
    assert body["firstName"] == "Anya"
    assert body["lastName"] == "Petrova"
    assert body["email"] == "anna@example.com"

    persisted = await client.get("/api/v1/auth/me", headers=headers)
    assert persisted.json()["firstName"] == "Anya"


async def test_update_me_requires_auth(client: AsyncClient):
    response = await client.patch("/api/v1/auth/me", json={"firstName": "Anya", "lastName": "Petrova"})
    assert response.status_code == 401


async def test_refresh_issues_a_new_access_token(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())

    response = await client.post("/api/v1/auth/refresh")

    assert response.status_code == 200
    assert "accessToken" in response.json()


async def test_refresh_without_a_cookie_is_rejected(client: AsyncClient):
    response = await client.post("/api/v1/auth/refresh")

    assert response.status_code == 401


async def test_logout_revokes_the_refresh_session(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())

    logout_response = await client.post("/api/v1/auth/logout")
    assert logout_response.status_code == 204

    refresh_response = await client.post("/api/v1/auth/refresh")
    assert refresh_response.status_code == 401


async def test_login_is_rate_limited(client: AsyncClient):
    bad_login = {"email": "nobody@example.com", "password": "WrongPass1"}

    for _ in range(5):
        await client.post("/api/v1/auth/login", json=bad_login)

    response = await client.post("/api/v1/auth/login", json=bad_login)

    assert response.status_code == 429
