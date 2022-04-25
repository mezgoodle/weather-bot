from typing import Optional

from aiogram import Bot
from aiogram.types import Message

from tgbot.misc.database import get_object
from tgbot.misc.weather_utils import weather_template, weather_icon, convert_date, convert_time

bot: Bot = Bot.get_current()


async def get_info(message: Message, user_id: str = None, city: str = None, days: int = None) -> Optional[Message]:
    geocode_api = bot.get('geocode_api')
    if city:
        response = await geocode_api.get(city)
        coords: dict = response['results'][0]['geometry']
        return await get_weather(coords['lat'], coords['lng'], days, city, message)
    if user := await get_object({'user_id': user_id}):
        response = await geocode_api.get(user['city'])
        coords: dict = response['results'][0]['geometry']
        return await get_weather(coords['lat'], coords['lng'], days, user['city'], message, user['lang'])
    return await message.answer('Cant find information')


async def get_weather(lat: float, lng: float, days: int, city: str, message: Message, lang: str = 'en') -> None:
    weather_api = bot.get('weather_api')
    response = await weather_api.get(lat, lng, lang)
    timezone_offset = response['timezone_offset']
    daily_forecast = response['daily']
    for index in range(days):
        date = convert_date(daily_forecast[index]['dt'] + timezone_offset)
        daily_forecast[index]['sunrise'] = convert_time(daily_forecast[index]['sunrise'] + timezone_offset)
        daily_forecast[index]['sunset'] = convert_time(daily_forecast[index]['sunset'] + timezone_offset)
        await message.answer_photo(weather_icon(daily_forecast[index]['weather'][0]['icon']),
                                   caption=weather_template(daily_forecast[index], date, city))
