from aiogram.types import KeyboardButton, ReplyKeyboardMarkup


def create_markup() -> ReplyKeyboardMarkup:
    markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    markup.add(KeyboardButton('Вперед'))
    markup.add(KeyboardButton("Назад"))
    return markup
