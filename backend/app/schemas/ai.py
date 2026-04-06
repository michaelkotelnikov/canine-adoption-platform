from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(system|user|assistant)$")
    content: str = Field(..., max_length=32000)


class DogChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=50)
