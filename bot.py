import functools
import logging
import os

from aiogram import Dispatcher
from aiogram.utils.executor import start_polling, start_webhook

from tgbot.config import load_config
from tgbot.middlewares.throttling import ThrottlingMiddleware
from tgbot.services.setting_commands import set_default_commands
from tgbot.misc.api import WeatherAPI, GeoCodeAPI
from loader import dp

logger = logging.getLogger(__name__)


def register_all_middlewares(dispatcher: Dispatcher) -> None:
    logger.info('Registering middlewares')
    dispatcher.setup_middleware(ThrottlingMiddleware())


def register_all_filters(dispatcher: Dispatcher) -> None:
    logger.info('Registering filters')


def register_all_handlers(dispatcher: Dispatcher) -> None:
    from tgbot import handlers
    logger.info('Registering handlers')


async def register_all_commands(dispatcher: Dispatcher) -> None:
    logger.info('Registering commands')
    await set_default_commands(dispatcher.bot)


async def on_startup(dispatcher: Dispatcher, webhook_url: str = None, weather_api_token: str = None,
                     geocode_api_token: str = None) -> None:
    register_all_middlewares(dispatcher)
    register_all_filters(dispatcher)
    register_all_handlers(dispatcher)

    dispatcher.bot['weather_api'] = WeatherAPI(weather_api_token)
    logger.info('Add weather_api to bot')

    dispatcher.bot['geocode_api'] = GeoCodeAPI(geocode_api_token)
    logger.info('Add geocode_api to bot')

    await register_all_commands(dispatcher)
    # Get current webhook status
    webhook = await dispatcher.bot.get_webhook_info()

    if webhook_url:
        await dispatcher.bot.set_webhook(webhook_url)
        logger.info('Webhook was set')
    elif webhook.url:
        await dispatcher.bot.delete_webhook()
        logger.info('Webhook was deleted')
    logger.info('Bot started')


async def on_shutdown(dispatcher: Dispatcher) -> None:
    weather_api = dispatcher.bot.get('weather_api')
    await weather_api.close()
    logger.info('Weather API was closed')

    geocode_api = dispatcher.bot.get('geocode_api')
    await geocode_api.close()
    logger.info('Geocode API was closed')

    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()
    logger.info('Bot shutdown')


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format=u'%(filename)s:%(lineno)d #%(levelname)-8s [%(asctime)s] - %(name)s - %(message)s',
    )
    config = load_config()

    # Webhook settings
    HEROKU_APP_NAME = os.getenv('HEROKU_APP_NAME')
    WEBHOOK_HOST = f'https://{HEROKU_APP_NAME}.herokuapp.com'
    WEBHOOK_PATH = f'/webhook/{config.tg_bot.token}'
    WEBHOOK_URL = f'{WEBHOOK_HOST}{WEBHOOK_PATH}'
    # Webserver settings
    WEBAPP_HOST = '0.0.0.0'
    WEBAPP_PORT = int(os.getenv('PORT', 5000))

    # start_polling(
    #     dispatcher=dp,
    #     on_startup=functools.partial(on_startup, weather_api_token=config.api.weather_token,
    #                                  geocode_api_token=config.api.geocode_api),
    #     on_shutdown=on_shutdown,
    #     skip_updates=True,
    # )

    start_webhook(
        dispatcher=dp,
        on_startup=functools.partial(on_startup, webhook_url=WEBHOOK_URL, weather_api_token=config.api.weather_token,
                                     geocode_api_token=config.api.geocode_api),
        on_shutdown=on_shutdown,
        webhook_path=WEBHOOK_PATH,
        skip_updates=True,
        host=WEBAPP_HOST,
        port=WEBAPP_PORT
    )
