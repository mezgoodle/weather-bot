# Weather bot(offline now)

Hi! This is the bot in Telegram for showing **weather information**. Built on Node.js.

## Motivation

I used to work with [OpenWeatherMap API](https://openweathermap.org/). It was in a projects with *React* and *Django*. Later I decided to make a bot that would show actual weather anywhere. My eye immediately fell on [Telegram](https://telegram.org/) as it is a beautiful eco system with a good one *API*. I chose the engine *Node.js* because I wanted to practice more with it.

## Build status

[![Build Status](https://travis-ci.com/mezgoodle/weather-bot.svg?branch=master)](https://travis-ci.com/mezgoodle/weather-bot)
[![pipeline status](https://gitlab.com/mezgoodle/weather-bot/badges/master/pipeline.svg)](https://gitlab.com/mezgoodle/weather-bot/-/commits/master)
![David](https://img.shields.io/david/mezgoodle/weather-bot?style=flat)

## Code style

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0298c15b448545e9b613d579f99fc283)](https://www.codacy.com/manual/mezgoodle/weather-bot?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mezgoodle/weather-bot&amp;utm_campaign=Badge_Grade)

## Scrennshots

![Screenshot 1](https://github.com/mezgoodle/images/blob/master/weather-bot1.png)

![Screenshot 2](https://github.com/mezgoodle/images/blob/master/weather-bot2.png)

![Screenshot 3](https://github.com/mezgoodle/images/blob/master/weather-bot3.png)

![Screenshot 4](https://github.com/mezgoodle/images/blob/master/weather-bot4.png)

## Tech/framework used

**Built with**
 - [Node.js](https://nodejs.org/uk/)
 - [node-telegram-bot-api](https://www.npmjs.com/package/node-telegram-bot-api)
 - [axios](https://www.npmjs.com/package/axios)
 - [mongoose](https://github.com/Automattic/mongoose)

## Features

With this bot you can find detailed information about the weather situation anywhere. Also you can set the city name and get the information of weather in this city by short command.

## Code Example

 - Working with database

```js
// Listener (handler) for telegram's /set event
bot.onText(/\/set (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const user_id = msg.from.id;
    const city = match.input.split(" ")[1];
    if (city === undefined) {
        bot.sendMessage(chatId, "Please provide city name");
        return;
    }
    User.findOneAndUpdate({ user_id }, { city }, (err, res) => {
        if (err) {
            bot.sendMessage(`Sorry, but now function is not working.\n\r Error: ${err}`);
        } else if (res === null) {
            const new_user = new User({
                user_id,
                city
            });
            new_user.save()
                .then(() => bot.sendMessage(chatId, `${msg.from.first_name}, your information has been saved`))
                .catch(() => {
                    bot.sendMessage(chatId, `${msg.from.first_name}, sorry, but something went wrong`)
                });

        } else {
            bot.sendMessage(chatId, `${msg.from.first_name}, your information has been updated`)
        }
        return;
    });

});
```

 - Main function

```js
// Function that gets the weather by the city name
const getWeather = (chatId, city) => {
    const endpoint = weatherEndpoint(city);

    axios.get(endpoint).then((resp) => {
        const {
            name,
            main,
            weather,
            wind,
            clouds
        } = resp.data;

        bot.sendPhoto(chatId, weatherIcon(weather[0].icon));
        bot.sendMessage(
            chatId,
            weatherHTMLTemplate(name, main, weather[0], wind, clouds), {
                parse_mode: "HTML"
            }
        );
    }, (error) => {
        console.log("error", error);
        bot.sendMessage(
            chatId,
            `Ooops...I couldn't be able to get weather for <b>${city}</b>`, {
                parse_mode: "HTML"
            }
        );
    });
};
```

## Installation

1. Clone this repository

```bash
git clone https://github.com/mezgoodle/weather-bot.git
```

2. Use the package manager [npm](http://www.npmjs.com/) to install dependencies.

```bash
npm install
```

3. Rename `.env_sample` to `.env` and fill the variables like:

```bash
TELEGRAM_TOKEN = "<YOUR_TELEGRAM_TOKEN>"
API_KEY = "<YOUR_API_KEY>"
DB_PASS = "<YOUR_PASSWORD_TO_DATABASE>"
```

4. Type in terminal:

```bash
npm install
```

## API Reference

Here I am using two main API services:
 - [Telegram Bot API](https://core.telegram.org/bots/api)
 - [Weather API](https://openweathermap.org/api)

## Tests

I have **no ideas** how to write here. If you want to help, please open **issues** and make **pull requests**. All are welcome!

## Deploy

I use [Gitlab](https://gitlab.com/) CI/CD system to deploy to [Heroku](https://www.heroku.com/). You can see this [gist](https://gist.github.com/mezgoodle/4ff277a6167bf92af448f5c339a44919) and do CD as me. 

## Contribute

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Credits

Repositories and links which inspired me to build this project:
 - https://github.com/VGhostPro/weather_telegram_bot
 - https://github.com/yagop/node-telegram-bot-api
 - https://github.com/fermentationist/wokeDyno/blob/master/wokeDyno.js
 - https://github.com/hosein2398/node-telegram-bot-api-tutorial#Creating+new+bot+with+BotFather
 - https://hackernoon.com/how-to-prevent-your-free-heroku-dyno-from-sleeping-dggxo3bi2
 - https://mvalipour.github.io/node.js/2015/11/10/build-telegram-bot-nodejs-heroku

## Contact

If you have questions write me here: 
  *   [Telegram](https://t.me/sylvenis)
  *   [Gmail](mailto:mezgoodle@gmail.com)
  *   [Facebook](https://www.facebook.com/profile.php?id=100005721694357)

## License

![GitHub](https://img.shields.io/github/license/mezgoodle/weather-bot)

MIT © [mezgoodle](https://github.com/mezgoodle)
