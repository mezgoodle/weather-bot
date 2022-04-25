from aiogram.types import Message
from aiogram.dispatcher.filters.builtin import RegexpCommandsFilter

from loader import dp
from tgbot.misc.database import update_object
from tgbot.misc.weather import get_info

import logging


@dp.message_handler(RegexpCommandsFilter(['\/lang (.+)']))
async def set_lang_handler(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    try:
        lang = message.text.split(' ')[1]
    except IndexError:
        await message.answer('Please provide lang code')
    user_id = message.from_user.id
    result = await update_object({'user_id': user_id}, {'lang': lang}, user_id)
    if result:
        return await message.answer(f'{message.from_user.first_name}, your language has been set to {lang}')
    else:
        return await message.answer('Something went wrong')


@dp.message_handler(RegexpCommandsFilter(['\/set (.+)']))
async def set_lang_handler(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    try:
        city = message.text.split(' ')[1]
    except IndexError:
        await message.answer('Please provide city name')
    user_id = message.from_user.id
    result = await update_object({'user_id': user_id}, {'city': city}, user_id)
    if result:
        return await message.answer(f'{message.from_user.first_name}, your information has been saved')
    else:
        return await message.answer('Something went wrong')


@dp.message_handler(commands=['w'])
async def get_defined_forecast(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')

    user_id = message.from_user.id

    text = await get_info(city='Vinnytsia')

    return await message.answer('Something went wrong')
