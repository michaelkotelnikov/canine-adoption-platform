import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_dogs_empty(client: AsyncClient):
    r = await client.get("/dogs")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_create_dog_requires_admin(client: AsyncClient):
    r = await client.post(
        "/dogs",
        json={
            "name": "X",
            "breed": "Y",
            "age": 2,
            "sex": "male",
            "size": "small",
            "description": "d",
            "photo_url": "https://example.com/x.jpg",
            "status": "available",
        },
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_admin_crud_flow(client: AsyncClient, admin_token: str):
    h = {"Authorization": f"Bearer {admin_token}"}
    r = await client.post(
        "/dogs",
        headers=h,
        json={
            "name": "Rex",
            "breed": "Shepherd",
            "age": 3,
            "sex": "male",
            "size": "large",
            "description": "Loyal.",
            "photo_url": "https://example.com/r.jpg",
            "status": "available",
        },
    )
    assert r.status_code == 201, r.text
    dog_id = r.json()["id"]

    r = await client.get("/dogs")
    assert r.status_code == 200
    assert len(r.json()) == 1

    r = await client.get(f"/dogs/{dog_id}")
    assert r.status_code == 200
    assert r.json()["name"] == "Rex"

    r = await client.patch(f"/dogs/{dog_id}", headers=h, json={"name": "Rex2"})
    assert r.status_code == 200
    assert r.json()["name"] == "Rex2"

    r = await client.delete(f"/dogs/{dog_id}", headers=h)
    assert r.status_code == 204

    r = await client.get(f"/dogs/{dog_id}")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_get_dog_404(client: AsyncClient):
    r = await client.get("/dogs/99999")
    assert r.status_code == 404
