from aiogram.types import Message
from aiogram.dispatcher.filters.builtin import Text

from loader import dp

import logging


@dp.message_handler(Text(equals=['hi', 'hello'], ignore_case=True))
async def echo(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    sender_name = message.from_user.first_name
    text = f'Hello, {sender_name}. I\'m bot for showing weather information by using <a ' \
           f'href="https://openweathermap.org/">OpenWeatherMap' \
           f'</a> API.\nMy creator is @sylvenis. ' \
           f'Also my code is <a href="https://github.com/mezgoodle/weather-bot">here' \
           f'</a>.\nGood luck!😉'
    return await message.answer(text)
