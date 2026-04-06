from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session
from app.mistral import stream_mistral_chat
from app.models.dog import Dog
from app.models.user import User
from app.schemas.ai import DogChatRequest
from app.users_setup import current_active_user

router = APIRouter(prefix="/dogs", tags=["ai"])


def _dog_overview_messages(dog: Dog) -> list[dict[str, str]]:
    system = (
        "You are a helpful assistant for a canine adoption platform. "
        "Write a warm, concise overview (2–4 short paragraphs) for potential adopters "
        "based only on the dog facts provided. Do not invent medical history or guarantees."
    )
    user = (
        f"Name: {dog.name}\nBreed: {dog.breed}\nAge: {dog.age}\nSex: {dog.sex}\n"
        f"Size: {dog.size}\nStatus: {dog.status}\nDescription:\n{dog.description}"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


def _sse_wrap(gen: AsyncIterator[str]) -> AsyncIterator[bytes]:
    async def inner() -> AsyncIterator[bytes]:
        async for payload in gen:
            yield f"data: {payload}\n\n".encode()

    return inner()


@router.post("/{dog_id}/ai/overview")
async def stream_dog_overview(
    dog_id: int,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(current_active_user),
):
    dog = await session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")
    messages = _dog_overview_messages(dog)
    stream = stream_mistral_chat(messages)
    return StreamingResponse(_sse_wrap(stream), media_type="text/event-stream")


@router.post("/{dog_id}/ai/chat")
async def stream_dog_chat(
    dog_id: int,
    body: DogChatRequest,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(current_active_user),
):
    dog = await session.get(Dog, dog_id)
    if not dog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")

    dog_context = (
        f"You are helping someone learn about {dog.name}, a {dog.age}-year-old "
        f"{dog.breed} ({dog.sex}, {dog.size}). Status: {dog.status}. "
        f"Shelter description: {dog.description}\n"
        "Answer follow-up questions accurately; if unknown, say you do not know."
    )
    messages: list[dict[str, str]] = [{"role": "system", "content": dog_context}]
    for m in body.messages:
        messages.append({"role": m.role, "content": m.content})

    stream = stream_mistral_chat(messages)
    return StreamingResponse(_sse_wrap(stream), media_type="text/event-stream")
