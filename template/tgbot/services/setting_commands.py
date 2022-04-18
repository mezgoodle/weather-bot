from aiogram import Bot
from aiogram.types import BotCommand


async def set_default_commands(bot: Bot) -> None:
    commands = [
        BotCommand(command='now', description='Get weather information in city'),
        BotCommand(command='tomorrow', description='Get weather information in city for tomorrow'),
        BotCommand(command='week', description='Get weather information in city for 7 days'),
        BotCommand(command='lang',
                   description='Set language information in database for getting main weather info in native language'),
        BotCommand(command='set', description='Set in database selected city.'),
        BotCommand(command='w', description='Get weather information in city by language that you set in database for '
                                            '3 days.'),
        BotCommand(command='location', description='Get actual information in the city by geographical point.'),
        BotCommand(command='help', description='Look for available commands'),
    ]
    await bot.set_my_commands(commands=commands)
