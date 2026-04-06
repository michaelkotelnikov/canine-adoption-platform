from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ai, dogs
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.users_setup import auth_backend, fastapi_users


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield


def _cors_origins() -> list[str]:
    return [o.strip() for o in settings.cors_origins.split(",") if o.strip()]


app = FastAPI(title="Canine Adoption API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(dogs.router)
app.include_router(ai.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
