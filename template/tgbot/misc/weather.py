from aiogram import Bot

from tgbot.misc.database import get_object


async def get_info(user_id: str = None, city: str = None, index: list = None):
    bot: Bot = Bot.get_current()
    if city:
        geocode_api = bot.get('geocode_api')
        response = await geocode_api.get(city)
        coords: dict = response['results'][0]['geometry']
        return coords
    if user := await get_object({'user_id': user_id}):
        return user
    return 'Cant find information'
