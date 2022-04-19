from aiogram.types import KeyboardButton, ReplyKeyboardMarkup


def create_markup() -> ReplyKeyboardMarkup:
    markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    markup.add(KeyboardButton('Send me location by button', request_location=True))
    return markup
