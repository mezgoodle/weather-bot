from aiogram.types import Message
from aiogram.dispatcher.filters.builtin import RegexpCommandsFilter

from loader import dp
from tgbot.misc.database import update_object
from tgbot.misc.weather import get_info

import logging


@dp.message_handler(RegexpCommandsFilter(['\/week (.+)']))
async def get_weather_week(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    try:
        city = message.text.split(' ')[1]
    except IndexError:
        await message.answer('Please write city name')
    return await get_info(message, city=city, days=[0,8])


@dp.message_handler(RegexpCommandsFilter(['\/now (.+)']))
async def get_weather_today(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    try:
        city = message.text.split(' ')[1]
    except IndexError:
        await message.answer('Please write city name')
    return await get_info(message, city=city, days=[0, 1])


@dp.message_handler(RegexpCommandsFilter(['\/tomorrow (.+)']))
async def get_weather_tomorrow(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    try:
        city = message.text.split(' ')[1]
    except IndexError:
        await message.answer('Please write city name')
    return await get_info(message, city=city, days=[1, 2])
