from aiogram.types import Message
from aiogram.dispatcher.filters import CommandHelp

from loader import dp

import logging


@dp.message_handler(CommandHelp(), state='*')
async def help_command(message: Message) -> Message:
    logger = logging.getLogger(__name__)
    logger.info('Handler executed')
    text = '''
    Hi!
Here you can see commands that you can type for this bot:
/now <b>city</b> - get weather information in city.
/tomorrow <b>city</b> - get weather information in city for tomorrow.
/week <b>city</b> - get weather information in city for 7 days.
/lang <b>lang_code</b> - set language information in database for
getting main weather info in native language
/set <b>city</b> - sets in database selected city.
/w - get weather information in city by language that you set in database for 3 days.
/location - get actual information in the city by geographical point.
/help - look for available commands
    '''
    return await message.reply(text)
