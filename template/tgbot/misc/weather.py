from typing import Union

from aiogram import Bot
from aiogram.types import Message

from tgbot.misc.database import get_object


async def get_info(user_id: str = None, city: str = None, index: list = None) -> Union[Message, str]:
    bot: Bot = Bot.get_current()
    geocode_api = bot.get('geocode_api')
    if city:
        response = await geocode_api.get(city)
        coords: dict = response['results'][0]['geometry']
        return await get_weather(coords['lat'], coords['lng'], index, city)
    if user := await get_object({'user_id': user_id}):
        response = await geocode_api.get(user['city'])
        coords: dict = response['results'][0]['geometry']
        return await get_weather(coords['lat'], coords['lng'], index, user['city'], user['lang'])
    return 'Cant find information'


async def get_weather(lat: float, lng: float, index: list, city: str, lang: str = 'en') -> Message:
    pass
