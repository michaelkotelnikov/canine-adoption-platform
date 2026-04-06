# Backend (`backend/`) — agent instructions

## Async FastAPI

- Ensure **all** database interactions and **API route handlers** are **strictly asynchronous**: define them with `async def` and use non-blocking database/session APIs end-to-end. Do not mix blocking ORM or I/O into async request paths.

## Schemas

- Use **Pydantic** models for **request** and **response** schemas so validation and OpenAPI stay accurate for clients (e.g. openapi-fetch).

## Authentication (fastapi-users)

- Integrate **fastapi-users** for **complete** authentication workflows: user registration and login, **secure password hashing**, and **JWT** issuance, validation, and refresh/rotation as the project’s auth design requires.
- Protect routes with FastAPI dependencies that enforce authentication (and roles, when applicable) consistently.
