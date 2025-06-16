from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Todo App"
    database_url: str = "sqlite:///./todos.db"
    debug: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()