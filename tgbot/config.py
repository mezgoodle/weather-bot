import os
from dataclasses import dataclass


@dataclass
class DbConfig:
    password: str
    database: str


@dataclass
class TgBot:
    token: str


@dataclass
class API:
    weather_token: str
    geocode_api: str


@dataclass
class Config:
    tg_bot: TgBot
    db: DbConfig
    api: API


def load_config(path: str = None) -> Config:
    # load_dotenv(path)
    return Config(
        tg_bot=TgBot(
            token=os.getenv('BOT_TOKEN', 'token'),
        ),
        db=DbConfig(
            password=os.getenv('DB_PASSWORD', 'password'),
            database=os.getenv('DB_NAME', 'test'),
        ),
        api=API(
            weather_token=os.getenv('WEATHER_TOKEN', 'token'),
            geocode_api=os.getenv('GEOCODE_API', 'token'),
        ),
    )
