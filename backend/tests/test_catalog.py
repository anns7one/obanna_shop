import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_list_categories_is_empty_by_default(client: AsyncClient):
    response = await client.get("/api/v1/categories")

    assert response.status_code == 200
    assert response.json() == []


async def test_list_products_returns_everything_by_default(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products")

    assert response.status_code == 200
    body = response.json()
    assert {p["id"] for p in body} == {"w-01", "w-02"}


async def test_list_products_filters_by_category(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products", params={"category": "men"})

    assert response.status_code == 200
    assert response.json() == []


async def test_list_products_searches_title_and_description(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products", params={"q": "blouse"})

    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == "w-02"


async def test_list_products_sorts_by_price_ascending(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products", params={"sort": "price-asc"})

    assert [p["id"] for p in response.json()] == ["w-02", "w-01"]


async def test_list_products_sorts_by_price_descending(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products", params={"sort": "price-desc"})

    assert [p["id"] for p in response.json()] == ["w-01", "w-02"]


async def test_get_product_by_slug(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products/test-dress")

    assert response.status_code == 200
    assert response.json()["title"] == "Test Dress"


async def test_get_product_by_slug_404s_when_missing(client: AsyncClient):
    response = await client.get("/api/v1/products/does-not-exist")

    assert response.status_code == 404


async def test_related_products_are_same_category_excluding_self(client: AsyncClient, sample_products):
    response = await client.get("/api/v1/products/test-dress/related")

    assert response.status_code == 200
    body = response.json()
    assert {p["id"] for p in body} == {"w-02"}
