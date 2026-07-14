import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

SHIPPING = {
    "fullName": "Shopper One",
    "address": "1 Test Street",
    "city": "Testville",
    "postalCode": "12345",
    "country": "Testland",
    "phone": "+10000000000",
}


async def _register_and_get_token(client: AsyncClient, email: str = "shopper@example.com") -> str:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Password1",
            "confirmPassword": "Password1",
            "firstName": "Shopper",
            "lastName": "One",
        },
    )
    return response.json()["accessToken"]


async def test_create_order_requires_auth(client: AsyncClient, sample_products):
    response = await client.post("/api/v1/orders", json={"items": [], "shipping": SHIPPING})

    assert response.status_code == 401


async def test_create_order_computes_total_from_real_price_and_decrements_stock(
    client: AsyncClient, sample_products
):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 2}],
        "shipping": SHIPPING,
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 201
    body = response.json()
    assert body["totalPrice"] == 200
    assert body["items"][0]["title"] == "Test Dress"
    assert body["items"][0]["price"] == 100

    product_response = await client.get("/api/v1/products/test-dress")
    assert product_response.json()["stock"] == 3


async def test_create_order_rejects_insufficient_stock(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # w-02 only has 1 in stock.
    payload = {
        "items": [{"productId": "w-02", "size": "S", "color": "Ivory", "quantity": 5}],
        "shipping": SHIPPING,
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 400

    product_response = await client.get("/api/v1/products/test-blouse")
    assert product_response.json()["stock"] == 1


async def test_create_order_rejects_unknown_product(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "does-not-exist", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 400


async def test_cancel_order_marks_it_cancelled(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
    }
    created = await client.post("/api/v1/orders", json=payload, headers=headers)
    order_id = created.json()["id"]

    response = await client.patch(f"/api/v1/orders/{order_id}/cancel", headers=headers)

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


async def test_cannot_cancel_another_users_order(client: AsyncClient, sample_products):
    token_a = await _register_and_get_token(client, email="buyer-a@example.com")
    token_b = await _register_and_get_token(client, email="buyer-b@example.com")

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
    }
    created = await client.post(
        "/api/v1/orders", json=payload, headers={"Authorization": f"Bearer {token_a}"}
    )
    order_id = created.json()["id"]

    response = await client.patch(
        f"/api/v1/orders/{order_id}/cancel", headers={"Authorization": f"Bearer {token_b}"}
    )

    assert response.status_code == 404


async def test_list_my_orders_only_returns_the_caller_own_orders(client: AsyncClient, sample_products):
    token_a = await _register_and_get_token(client, email="buyer-a@example.com")
    token_b = await _register_and_get_token(client, email="buyer-b@example.com")

    payload = {
        "items": [{"productId": "w-02", "size": "S", "color": "Ivory", "quantity": 1}],
        "shipping": SHIPPING,
    }
    await client.post("/api/v1/orders", json=payload, headers={"Authorization": f"Bearer {token_a}"})

    response_b = await client.get("/api/v1/orders/my", headers={"Authorization": f"Bearer {token_b}"})
    assert response_b.status_code == 200
    assert response_b.json() == []

    response_a = await client.get("/api/v1/orders/my", headers={"Authorization": f"Bearer {token_a}"})
    assert response_a.status_code == 200
    assert len(response_a.json()) == 1
