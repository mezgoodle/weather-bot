from aiogram.types import Message
from aiogram.dispatcher.filters import CommandHelp

from loader import dp
from tgbot.misc.database import get_all_objects

import logging
import pprint


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
    # weather_info = message.bot.get('weather_api')
    # data = await weather_info.get('55.75', '37.57')
    # pprint.pprint(f'{data=}')
    geocode_info = message.bot.get('geocode_api')
    data = await geocode_info.get('Kyiv')
    pprint.pprint(data['results'][0]['geometry'])
    return await message.reply(text)
