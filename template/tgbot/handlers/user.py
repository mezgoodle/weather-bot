from aiogram.dispatcher.filters import CommandStart
from aiogram.types import Message

from loader import dp
from tgbot.keyboards.reply.state_keyboard import create_markup
from tgbot.states.states import Example
from tgbot.middlewares.throttling import rate_limit

import logging


@dp.message_handler(CommandStart(), state="*")
@rate_limit(5, 'start')
async def user_command(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')

    await Example.first()
    markup = create_markup()
    await message.reply("Hello, user!", reply_markup=markup)
