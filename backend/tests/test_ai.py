import pytest
from httpx import AsyncClient

from app.models.dog import Dog


@pytest.mark.asyncio
async def test_overview_requires_auth(client: AsyncClient, sample_dog: Dog):
    r = await client.post(f"/dogs/{sample_dog.id}/ai/overview")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_overview_streams_error_without_mistral_key(
    client: AsyncClient, admin_token: str, sample_dog: Dog, monkeypatch
):
    from app import config

    monkeypatch.setattr(config.settings, "mistral_api_key", "")

    r = await client.post(
        f"/dogs/{sample_dog.id}/ai/overview",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("text/event-stream")
    body = r.text
    assert "error" in body.lower() or "not configured" in body.lower()


@pytest.mark.asyncio
async def test_chat_streams_error_without_mistral_key(
    client: AsyncClient, admin_token: str, sample_dog: Dog, monkeypatch
):
    from app import config

    monkeypatch.setattr(config.settings, "mistral_api_key", "")

    r = await client.post(
        f"/dogs/{sample_dog.id}/ai/chat",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"messages": [{"role": "user", "content": "Hello"}]},
    )
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("text/event-stream")
    assert "error" in r.text.lower()
