from aiogram.types import Message

from loader import dp
from tgbot.keyboards.reply import location_keyboard

import logging


@dp.message_handler(commands=['location'])
async def location_command(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    markup = location_keyboard.create_markup()
    return await message.reply('Send me location by button', reply_markup=markup)
