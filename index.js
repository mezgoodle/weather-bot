const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;
// replace the value below with the OpenWeatherMap api_key you receive from their website
const api_key = process.env.API_KEY;
// MongoDB database config
const dbURI = `mongodb+srv://mezgoodle:${process.env.DB_PASS}@weather-user-data-suiox.mongodb.net/test?retryWrites=true&w=majority`;

// Connect to Mongo
mongoose.connect(dbURI, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.log(err));

// Create a bot that uses 'polling' to fetch new updates. It`s for development
// const bot = new TelegramBot(token, { polling: true });
// Create a bot that uses 'webhook' to get new updates. It`s for production ========
const options = {
    webHook: {
        port: process.env.PORT
    }
};
const url = process.env.APP_URL || "https://weather-bot-mezgoodle.herokuapp.com:443";
const bot = new TelegramBot(token, options);
bot.setWebHook(`${url}/bot${token}`);
// =============

// OpenWeatherMap endpoint for getting weather by city name
const weatherEndpoint = (city) => (
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${api_key}`
);

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHTMLTemplate = (name, main, weather, wind, clouds) => (
    `The weather in <b>${name}</b>:
  <b>${weather.main}</b> - ${weather.description}
  Temperature: <b>${main.temp} °C</b>
  Pressure: <b>${main.pressure} hPa</b>
  Humidity: <b>${main.humidity} %</b>
  Wind: <b>${wind.speed} meter/sec</b>
  Clouds: <b>${clouds.all} %</b>
  `
);

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

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        `Welcome at <b>Weather Bot</b>, thank you for using my service
      
  Available commands:
  
  /now <b>city</b> - shows weather for selected <b>city</b>
    `, {
            parse_mode: "HTML"
        }
    );
});

// Listener (handler) for telegram's /now event
bot.onText(/\/now (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const city = match.input.split(" ")[1];
    if (city === undefined) {
        bot.sendMessage(chatId, "Please provide city name");
        return;
    }
    getWeather(chatId, city);
});

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
                    bot.sendMessage(chatId, `${msg.from.first_name}, sorry, but something went wrong`);
                });

        } else {
            bot.sendMessage(chatId, `${msg.from.first_name}, your information has been updated`);
        }
        return;
    });

});

// Listener (handler) for telegram's /w event
bot.onText(/\/w/, (msg) => {
    const chatId = msg.chat.id;
    const user_id = msg.from.id;
    User.findOne({ user_id })
        .then((doc) => {
            if (doc) {
                getWeather(chatId, doc.city);
            } else {
                bot.sendMessage(chatId, `Can not find your information, ${msg.from.first_name}.\n\rPlease, type \/set [city] command.`);
            }
        })
        .catch((err) => {
            bot.sendMessage(chatId, `Sorry, but now function is not working.\n\rError: ${err}`);
        });
});

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.toString().toLowerCase().includes("hi") || msg.text.toString().toLowerCase().includes("hello")) {
        let str = `Hello, ${msg.from.first_name}. I\'m bot for showing weather information by using [OpenWeatherMap](https://openweathermap.org/) API.\nMy creator is @sylvenis. Also my code is [here](https://github.com/mezgoodle/weather-bot).\nGood luck!😉`;
        bot.sendMessage(chatId, str, { parse_mode: "Markdown" });
    }
    if (msg.text.toString().toLowerCase().includes("bye")) {
        bot.sendMessage(chatId, "Have a nice day, " + msg.from.first_name);
    }
});

// Listen for errors
bot.on("polling_error", (err) => console.log(err));