from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

from app.models.password_reset_token import PasswordResetToken
from app.security import generate_reset_token

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _register_payload(**overrides) -> dict:
    payload = {
        "email": "anna@example.com",
        "password": "Password1",
        "confirmPassword": "Password1",
        "firstName": "Anna",
        "lastName": "Ivanova",
        "phone": "+15551234567",
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
        "/api/v1/auth/me",
        json={"firstName": "Anya", "lastName": "Petrova", "phone": "+15559876543"},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["firstName"] == "Anya"
    assert body["lastName"] == "Petrova"
    assert body["phone"] == "+15559876543"
    assert body["email"] == "anna@example.com"

    persisted = await client.get("/api/v1/auth/me", headers=headers)
    assert persisted.json()["firstName"] == "Anya"


async def test_update_me_rejects_a_phone_already_used_by_another_account(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload(email="first@example.com", phone="+15550000001"))
    second = await client.post(
        "/api/v1/auth/register", json=_register_payload(email="second@example.com", phone="+15550000002")
    )
    headers = {"Authorization": f"Bearer {second.json()['accessToken']}"}

    response = await client.patch(
        "/api/v1/auth/me",
        json={"firstName": "Anya", "lastName": "Petrova", "phone": "+15550000001"},
        headers=headers,
    )

    assert response.status_code == 409


async def test_update_me_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/api/v1/auth/me", json={"firstName": "Anya", "lastName": "Petrova", "phone": "+15551234567"}
    )
    assert response.status_code == 401


async def test_register_rejects_duplicate_phone(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload(email="one@example.com", phone="+15551110000"))
    response = await client.post(
        "/api/v1/auth/register", json=_register_payload(email="two@example.com", phone="+15551110000")
    )

    assert response.status_code == 409


async def test_forgot_password_always_returns_no_content(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())

    known = await client.post("/api/v1/auth/forgot-password", json={"email": "anna@example.com"})
    unknown = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})

    assert known.status_code == 204
    assert unknown.status_code == 204


async def test_reset_password_with_bad_token_is_rejected(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=_register_payload())

    response = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "anna@example.com",
            "token": "not-a-real-token",
            "password": "NewPassword1",
            "confirmPassword": "NewPassword1",
        },
    )

    assert response.status_code == 400


async def test_reset_password_end_to_end_then_old_password_stops_working(client: AsyncClient, db_session):
    register_response = await client.post("/api/v1/auth/register", json=_register_payload())
    user_id = register_response.json()["user"]["id"]

    raw_token, token_hash = generate_reset_token()
    db_session.add(
        PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        )
    )
    await db_session.commit()

    reset_response = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "anna@example.com",
            "token": raw_token,
            "password": "NewPassword1",
            "confirmPassword": "NewPassword1",
        },
    )
    assert reset_response.status_code == 204

    old_login = await client.post(
        "/api/v1/auth/login", json={"email": "anna@example.com", "password": "Password1"}
    )
    assert old_login.status_code == 401

    new_login = await client.post(
        "/api/v1/auth/login", json={"email": "anna@example.com", "password": "NewPassword1"}
    )
    assert new_login.status_code == 200

    reused = await client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "anna@example.com",
            "token": raw_token,
            "password": "AnotherPassword1",
            "confirmPassword": "AnotherPassword1",
        },
    )
    assert reused.status_code == 400


async def test_change_password_requires_correct_current_password(client: AsyncClient):
    register_response = await client.post("/api/v1/auth/register", json=_register_payload())
    headers = {"Authorization": f"Bearer {register_response.json()['accessToken']}"}

    wrong = await client.post(
        "/api/v1/auth/change-password",
        json={"currentPassword": "WrongPassword1", "newPassword": "NewPassword1", "confirmNewPassword": "NewPassword1"},
        headers=headers,
    )
    assert wrong.status_code == 400

    right = await client.post(
        "/api/v1/auth/change-password",
        json={"currentPassword": "Password1", "newPassword": "NewPassword1", "confirmNewPassword": "NewPassword1"},
        headers=headers,
    )
    assert right.status_code == 204

    relogin = await client.post(
        "/api/v1/auth/login", json={"email": "anna@example.com", "password": "NewPassword1"}
    )
    assert relogin.status_code == 200


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
