import logging
from typing import Optional

from aiogram.utils.exceptions import (TelegramAPIError,
                                      MessageNotModified,
                                      CantParseEntities)

from loader import dp

logger = logging.getLogger(__name__)


@dp.errors_handler()
async def errors_handler(update, exception) -> Optional[bool]:
    if isinstance(exception, MessageNotModified):
        logger.exception('Message is not modified')
        # do something here?
        return True

    if isinstance(exception, CantParseEntities):
        # or here
        logger.exception(f'CantParseEntities: {exception} \nUpdate: {update}')
        return True

    #  MUST BE THE  LAST CONDITION
    if isinstance(exception, TelegramAPIError):
        logger.exception(f'TelegramAPIError: {exception} \nUpdate: {update}')
        return True

    # At least you have tried.
    logger.exception(f'Update: {update} \n{exception}')
