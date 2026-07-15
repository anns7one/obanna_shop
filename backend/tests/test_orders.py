import hashlib

import pytest
from httpx import AsyncClient
from sqlalchemy import update

from app.models.order import Order, OrderStatus

pytestmark = pytest.mark.asyncio(loop_scope="session")

SHIPPING = {
    "fullName": "Shopper One",
    "address": "1 Test Street",
    "city": "Testville",
    "postalCode": "12345",
    "country": "Testland",
    "phone": "+10000000000",
}

CONTACT = {
    "contactFullName": "Shopper One",
    "contactPhone": "+10000000000",
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


async def test_create_order_requires_auth(client: AsyncClient, sample_products):
    response = await client.post("/api/v1/orders", json={"items": [], "shipping": SHIPPING, **CONTACT})

    assert response.status_code == 401


async def test_create_order_computes_total_from_real_price_and_decrements_stock(
    client: AsyncClient, sample_products
):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 2}],
        "shipping": SHIPPING,
        **CONTACT,
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 201
    body = response.json()
    # 2 x $100 = $200, over the $75 free-shipping threshold, so no delivery fee.
    assert body["totalPrice"] == 200
    assert body["deliveryCost"] == 0
    assert body["paymentMethodLabel"] == "Cash on delivery"
    assert isinstance(body["orderNumber"], int)
    assert body["items"][0]["title"] == "Test Dress"
    assert body["items"][0]["price"] == 100

    product_response = await client.get("/api/v1/products/test-dress")
    assert product_response.json()["stock"] == 3


async def test_create_order_adds_delivery_cost_under_free_shipping_threshold(
    client: AsyncClient, sample_products
):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1 x $50 = $50, under the $75 threshold.
    payload = {
        "items": [{"productId": "w-02", "size": "S", "color": "Ivory", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 201
    body = response.json()
    assert body["deliveryCost"] == 8
    assert body["totalPrice"] == 58


async def test_create_order_rejects_insufficient_stock(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # w-02 only has 1 in stock.
    payload = {
        "items": [{"productId": "w-02", "size": "S", "color": "Ivory", "quantity": 5}],
        "shipping": SHIPPING,
        **CONTACT,
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
        **CONTACT,
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 400


async def test_create_order_rejects_a_payment_method_owned_by_another_user(client: AsyncClient, sample_products):
    token_a = await _register_and_get_token(client, email="buyer-a@example.com")
    token_b = await _register_and_get_token(client, email="buyer-b@example.com")

    card = await client.post(
        "/api/v1/payment-methods",
        json={"brand": "visa", "last4": "4242", "expMonth": 12, "expYear": 2030, "isDefault": False},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
        "paymentMethodId": card.json()["id"],
    }
    response = await client.post(
        "/api/v1/orders", json=payload, headers={"Authorization": f"Bearer {token_b}"}
    )

    assert response.status_code == 400


async def test_create_order_with_a_saved_payment_method_derives_its_label(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    card = await client.post(
        "/api/v1/payment-methods",
        json={"brand": "visa", "last4": "4242", "expMonth": 12, "expYear": 2030, "isDefault": False},
        headers=headers,
    )
    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
        "paymentMethodId": card.json()["id"],
    }
    response = await client.post("/api/v1/orders", json=payload, headers=headers)

    assert response.status_code == 201
    assert response.json()["paymentMethodLabel"] == "Visa •••• 4242"


async def test_cancel_order_marks_it_cancelled(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
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
        **CONTACT,
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
        **CONTACT,
    }
    await client.post("/api/v1/orders", json=payload, headers={"Authorization": f"Bearer {token_a}"})

    response_b = await client.get("/api/v1/orders/my", headers={"Authorization": f"Bearer {token_b}"})
    assert response_b.status_code == 200
    assert response_b.json() == []

    response_a = await client.get("/api/v1/orders/my", headers={"Authorization": f"Bearer {token_a}"})
    assert response_a.status_code == 200
    assert len(response_a.json()) == 1


async def test_get_order_returns_the_full_order_to_its_owner(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
    }
    created = await client.post("/api/v1/orders", json=payload, headers=headers)
    order_id = created.json()["id"]

    response = await client.get(f"/api/v1/orders/{order_id}", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == order_id
    assert body["contactFullName"] == "Shopper One"
    assert body["paymentMethodLabel"] == "Cash on delivery"


async def test_get_order_is_not_visible_to_another_user(client: AsyncClient, sample_products):
    token_a = await _register_and_get_token(client, email="buyer-a@example.com")
    token_b = await _register_and_get_token(client, email="buyer-b@example.com")

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
    }
    created = await client.post(
        "/api/v1/orders", json=payload, headers={"Authorization": f"Bearer {token_a}"}
    )
    order_id = created.json()["id"]

    response = await client.get(
        f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {token_b}"}
    )

    assert response.status_code == 404


async def test_change_payment_method_updates_the_label(client: AsyncClient, sample_products):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
    }
    created = await client.post("/api/v1/orders", json=payload, headers=headers)
    order_id = created.json()["id"]
    assert created.json()["paymentMethodLabel"] == "Cash on delivery"

    card = await client.post(
        "/api/v1/payment-methods",
        json={"brand": "mastercard", "last4": "4444", "expMonth": 6, "expYear": 2031, "isDefault": False},
        headers=headers,
    )

    response = await client.patch(
        f"/api/v1/orders/{order_id}/payment-method",
        json={"paymentMethodId": card.json()["id"]},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["paymentMethodLabel"] == "Mastercard •••• 4444"


async def test_change_payment_method_rejected_after_shipment(client: AsyncClient, sample_products, db_session):
    token = await _register_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "items": [{"productId": "w-01", "size": "M", "color": "Blush", "quantity": 1}],
        "shipping": SHIPPING,
        **CONTACT,
    }
    created = await client.post("/api/v1/orders", json=payload, headers=headers)
    order_id = created.json()["id"]

    await db_session.execute(update(Order).where(Order.id == order_id).values(status=OrderStatus.SHIPPED))
    await db_session.commit()

    response = await client.patch(
        f"/api/v1/orders/{order_id}/payment-method", json={"paymentMethodId": None}, headers=headers
    )

    assert response.status_code == 400
