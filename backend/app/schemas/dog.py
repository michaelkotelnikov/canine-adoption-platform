from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DogBase(BaseModel):
    name: str = Field(..., max_length=120)
    breed: str = Field(..., max_length=120)
    age: int = Field(..., ge=0, le=40)
    sex: str = Field(..., max_length=32)
    size: str = Field(..., max_length=32)
    description: str
    photo_url: str = Field(..., max_length=2048)
    status: str = Field(default="available", pattern="^(available|adopted)$")


class DogCreate(DogBase):
    pass


class DogUpdate(BaseModel):
    name: str | None = Field(None, max_length=120)
    breed: str | None = Field(None, max_length=120)
    age: int | None = Field(None, ge=0, le=40)
    sex: str | None = Field(None, max_length=32)
    size: str | None = Field(None, max_length=32)
    description: str | None = None
    photo_url: str | None = Field(None, max_length=2048)
    status: str | None = Field(None, pattern="^(available|adopted)$")


class DogRead(DogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
