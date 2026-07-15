import hashlib

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

ADDRESS = {
    "label": "Home",
    "fullName": "Shopper One",
    "address": "1 Test Street",
    "city": "Testville",
    "postalCode": "12345",
    "country": "Testland",
    "phone": "+10000000000",
    "isDefault": True,
}


def _phone_for(email: str) -> str:
    """A fake but distinct-per-email phone (just digits behind a '+', no
    assumption about which country's dialing format it represents) — tests
    need every registered user to have a unique phone now that it's a
    unique column."""
    digest = hashlib.md5(email.encode()).hexdigest()
    return "+" + str(int(digest[:9], 16))[:11]


async def _register_and_get_token(client: AsyncClient, email: str = "shopper@example.com") -> str:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Password1",
            "confirmPassword": "Password1",
            "firstName": "Shopper",
            "lastName": "One",
            "phone": _phone_for(email),
        },
    )
    return response.json()["accessToken"]


async def test_address_endpoints_require_auth(client: AsyncClient):
    assert (await client.get("/api/v1/addresses")).status_code == 401
    assert (await client.post("/api/v1/addresses", json=ADDRESS)).status_code == 401


async def test_create_list_update_delete_address(client: AsyncClient):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create_response = await client.post("/api/v1/addresses", json=ADDRESS, headers=headers)
    assert create_response.status_code == 201
    address_id = create_response.json()["id"]
    assert create_response.json()["isDefault"] is True

    list_response = await client.get("/api/v1/addresses", headers=headers)
    assert len(list_response.json()) == 1

    updated = {**ADDRESS, "city": "New City"}
    update_response = await client.put(f"/api/v1/addresses/{address_id}", json=updated, headers=headers)
    assert update_response.status_code == 200
    assert update_response.json()["city"] == "New City"

    delete_response = await client.delete(f"/api/v1/addresses/{address_id}", headers=headers)
    assert delete_response.status_code == 204

    empty_response = await client.get("/api/v1/addresses", headers=headers)
    assert empty_response.json() == []


async def test_cannot_read_or_modify_another_users_address(client: AsyncClient):
    token_a = await _register_and_get_token(client, email="owner@example.com")
    token_b = await _register_and_get_token(client, email="stranger@example.com")

    created = await client.post("/api/v1/addresses", json=ADDRESS, headers={"Authorization": f"Bearer {token_a}"})
    address_id = created.json()["id"]

    headers_b = {"Authorization": f"Bearer {token_b}"}
    assert (await client.put(f"/api/v1/addresses/{address_id}", json=ADDRESS, headers=headers_b)).status_code == 404
    assert (await client.delete(f"/api/v1/addresses/{address_id}", headers=headers_b)).status_code == 404


async def test_only_one_address_stays_default(client: AsyncClient):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    first = await client.post("/api/v1/addresses", json=ADDRESS, headers=headers)
    second = await client.post("/api/v1/addresses", json={**ADDRESS, "label": "Work"}, headers=headers)

    listed = {a["id"]: a["isDefault"] for a in (await client.get("/api/v1/addresses", headers=headers)).json()}
    assert listed[first.json()["id"]] is False
    assert listed[second.json()["id"]] is True
