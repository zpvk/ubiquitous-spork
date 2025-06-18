from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Todo App"
    database_url: str = "sqlite:///./todos.db"
    debug: bool = True  # WARNING: Set to False in production!
    # Add a note for future: restrict CORS and disable debug in prod
    # For authentication, see docs/auth.md (to be implemented)
    
    class Config:
        env_file = ".env"

settings = Settings()