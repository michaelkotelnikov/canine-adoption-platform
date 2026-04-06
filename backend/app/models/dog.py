import enum
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DogStatus(str, enum.Enum):
    available = "available"
    adopted = "adopted"


class Dog(Base):
    __tablename__ = "dogs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    breed: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    sex: Mapped[str] = mapped_column(String(32), nullable=False)
    size: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    photo_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default=DogStatus.available.value
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
