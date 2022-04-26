# Weather bot

Hi! This is the bot in Telegram for showing **weather information**. Built with Node.js.

>[link](https://t.me/weather_mezgoodle_bot) to bot

## Motivation

I used to work with [OpenWeatherMap API](https://openweathermap.org/). It was in a projects with *React* and *Django*. Later I decided to make a bot that would show actual weather anywhere. My eye immediately fell on [Telegram](https://telegram.org/) as it is a beautiful eco system with a good one *API*. I have chosen *Python* because I wanted to practice more with it.

## Build status

[![Node.js CI](https://github.com/mezgoodle/weather-bot/actions/workflows/node.js.yml/badge.svg)](https://github.com/mezgoodle/weather-bot/actions/workflows/node.js.yml)
![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline-status/mezgoodle/weather-bot?branch=master)

## Screenshots

![Screenshot 1](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot1.png)

![Screenshot 2](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot2.png)

![Screenshot 3](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot3.png)

![Screenshot 8](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot8.png)

![Screenshot 4](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot4.png)

![Screenshot 6](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot6.png)

![Screenshot 7](https://raw.githubusercontent.com/mezgoodle/images/master/weather-bot7.png)

## Tech framework used

**Built with**
 - [Python](https://www.python.org/)
 - [aiogram](https://docs.aiogram.dev/en/latest/)
 - [aiohttp](https://docs.aiohttp.org/en/stable/)
 - [motor](https://motor.readthedocs.io/en/stable/)

## Features

- /now **city** - get weather information in city.

- /week **city** - get weather information in city for 7 days.

- /lang **lang_code** - set language information in database for getting main weather info in native language

- /set **city** - sets in database selected city.

- /w - get weather information in city by language that you set in database for 3 days.

- /location - get actual information in the city by geographical point.

## Installation

1. Clone this repository

```bash
git clone https://github.com/mezgoodle/weather-bot.git
```

2. Use the package manager **pip** to install dependencies.

```bash
pip install -r requirements.txt
```

3. Fill the variables in `config.py`

4. Type in terminal:

```bash
python bot.py
```

## Contribute

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Credits

Repositories and links which inspired me to build this project:
- [GitHub repo](https://github.com/VGhostPro/weather_telegram_bot)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [wokeDyno.js](https://github.com/fermentationist/wokeDyno/blob/master/wokeDyno.js)
- [Some literature](https://github.com/hosein2398/node-telegram-bot-api-tutorial#Creating+new+bot+with+BotFather)

## Contact

If you have questions write me here: 
  *   [Telegram](https://t.me/sylvenis)
  *   [Gmail](mailto:mezgoodle@gmail.com)
  *   [Facebook](https://www.facebook.com/profile.php?id=100005721694357)

## License

![GitHub](https://img.shields.io/github/license/mezgoodle/weather-bot)

MIT © [mezgoodle](https://github.com/mezgoodle)
