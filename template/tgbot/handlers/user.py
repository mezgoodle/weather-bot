from aiogram.types import Message
from aiogram.dispatcher.filters.builtin import RegexpCommandsFilter

from loader import dp

import logging


@dp.message_handler(RegexpCommandsFilter(['\/lang (.+)']))
async def set_lang_handler(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    print(message.text.split(' ')[1])
    return await message.answer('Hello')
