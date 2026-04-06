import json
from collections.abc import AsyncIterator

import httpx

from app.config import settings

MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"


async def stream_mistral_chat(messages: list[dict[str, str]]) -> AsyncIterator[str]:
    if not settings.mistral_api_key:
        yield json.dumps({"type": "error", "message": "Mistral API key not configured"})
        return

    payload = {
        "model": settings.mistral_model,
        "messages": messages,
        "stream": True,
    }
    headers = {
        "Authorization": f"Bearer {settings.mistral_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
        async with client.stream("POST", MISTRAL_URL, json=payload, headers=headers) as resp:
            if resp.status_code >= 400:
                err_text = await resp.aread()
                yield json.dumps(
                    {
                        "type": "error",
                        "message": f"Mistral API error {resp.status_code}",
                        "detail": err_text.decode()[:500],
                    }
                )
                return
            async for line in resp.aiter_lines():
                if not line or line.startswith(":"):
                    continue
                if line == "data: [DONE]":
                    yield json.dumps({"type": "done"})
                    break
                if line.startswith("data: "):
                    raw = line[6:]
                    try:
                        chunk = json.loads(raw)
                    except json.JSONDecodeError:
                        continue
                    choices = chunk.get("choices") or []
                    if not choices:
                        continue
                    delta = choices[0].get("delta") or {}
                    text = delta.get("content")
                    if text:
                        yield json.dumps({"type": "delta", "text": text})
