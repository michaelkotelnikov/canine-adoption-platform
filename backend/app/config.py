from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://canine:canine@localhost:5432/canine"
    jwt_secret: str = "change_me"
    mistral_api_key: str = ""
    cors_origins: str = "http://localhost:3000"
    mistral_model: str = "mistral-small-latest"


settings = Settings()
