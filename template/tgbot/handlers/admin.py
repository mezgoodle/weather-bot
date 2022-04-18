from aiogram.types import Message
from aiogram.dispatcher.filters import CommandStart

from loader import dp

import logging


@dp.message_handler(CommandStart(), state='*', is_admin=True)
async def admin_command(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    await message.reply(f'Hello, {message.from_user.username}!')
