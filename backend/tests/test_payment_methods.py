import hashlib

import pytest
from httpx import AsyncClient

from app.models.payment_method import PaymentMethod

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _phone_for(email: str) -> str:
    """A fake but distinct-per-email phone (just digits behind a '+', no
    assumption about which country's dialing format it represents) — tests
    need every registered user to have a unique phone now that it's a
    unique column."""
    digest = hashlib.md5(email.encode()).hexdigest()
    return "+" + str(int(digest[:9], 16))[:11]


async def _register_and_get_token(client: AsyncClient, email: str = "cardholder@example.com") -> str:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Password1",
            "confirmPassword": "Password1",
            "firstName": "Card",
            "lastName": "Holder",
            "phone": _phone_for(email),
        },
    )
    return response.json()["accessToken"]


VALID_PAYLOAD = {
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2030,
    "isDefault": True,
}


# ---------------------------------------------------------------------------
# The core security property: this API and its storage are structurally
# incapable of holding a full card number or CVV — not just "doesn't use"
# them, but has nowhere to put them even if a client sent one.
# ---------------------------------------------------------------------------


async def test_payment_method_model_has_no_sensitive_card_columns():
    column_names = set(PaymentMethod.__table__.columns.keys())
    sensitive = {"card_number", "cardnumber", "pan", "cvv", "cvc", "security_code"}
    assert column_names.isdisjoint(sensitive), (
        f"PaymentMethod table must never store a raw card number or CVV, found: "
        f"{column_names & sensitive}"
    )
    # Only ever non-sensitive, display-safe fields.
    assert column_names == {
        "id",
        "user_id",
        "brand",
        "last4",
        "exp_month",
        "exp_year",
        "is_default",
        "created_at",
    }


async def test_create_payment_method_rejects_a_full_card_number_or_cvv(client: AsyncClient):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Simulates a buggy or malicious client trying to smuggle raw card data
    # through — the schema has no such field, and extra="forbid" means this
    # must be rejected outright rather than silently accepted-and-dropped
    # (a silent drop could hide the exact bug that leaks a PAN into logs).
    payload = {
        **VALID_PAYLOAD,
        "cardNumber": "4242424242424242",
        "cvv": "123",
    }
    response = await client.post("/api/v1/payment-methods", json=payload, headers=headers)

    assert response.status_code == 422


async def test_create_payment_method_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/payment-methods", json=VALID_PAYLOAD)
    assert response.status_code == 401


async def test_create_and_list_payment_method_only_ever_exposes_last4(client: AsyncClient):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = await client.post("/api/v1/payment-methods", json=VALID_PAYLOAD, headers=headers)
    assert create_response.status_code == 201
    body = create_response.json()

    assert body["last4"] == "4242"
    assert body["brand"] == "visa"
    assert body["expMonth"] == 12
    assert body["expYear"] == 2030
    # The response can only ever contain what the read schema declares —
    # assert the exact key set so a future accidental field addition (e.g.
    # someone adding `card_number` to PaymentMethodRead) fails a test.
    assert set(body.keys()) == {"id", "brand", "last4", "expMonth", "expYear", "isDefault"}

    list_response = await client.get("/api/v1/payment-methods", headers=headers)
    assert list_response.status_code == 200
    [only_method] = list_response.json()
    assert only_method["last4"] == "4242"
    assert set(only_method.keys()) == {"id", "brand", "last4", "expMonth", "expYear", "isDefault"}


async def test_second_default_payment_method_unsets_the_first(client: AsyncClient):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    first = await client.post("/api/v1/payment-methods", json=VALID_PAYLOAD, headers=headers)
    second = await client.post(
        "/api/v1/payment-methods",
        json={**VALID_PAYLOAD, "last4": "1111", "isDefault": True},
        headers=headers,
    )
    assert first.json()["isDefault"] is True
    assert second.json()["isDefault"] is True

    listed = {m["id"]: m["isDefault"] for m in (await client.get("/api/v1/payment-methods", headers=headers)).json()}
    assert listed[first.json()["id"]] is False
    assert listed[second.json()["id"]] is True


async def test_cannot_delete_another_users_payment_method(client: AsyncClient):
    token_a = await _register_and_get_token(client, email="owner@example.com")
    token_b = await _register_and_get_token(client, email="attacker@example.com")

    created = await client.post(
        "/api/v1/payment-methods", json=VALID_PAYLOAD, headers={"Authorization": f"Bearer {token_a}"}
    )
    method_id = created.json()["id"]

    response = await client.delete(
        f"/api/v1/payment-methods/{method_id}", headers={"Authorization": f"Bearer {token_b}"}
    )
    assert response.status_code == 404

    # Still there, untouched, when the real owner checks.
    still_there = await client.get("/api/v1/payment-methods", headers={"Authorization": f"Bearer {token_a}"})
    assert len(still_there.json()) == 1
