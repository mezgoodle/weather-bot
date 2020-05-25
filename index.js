'use strict';

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("./models/User");
const { token, api_key, dbURI } = require("./config");

// Storage of different urls for api queries
const urls = {
    now: "weather",
    tomorrow: "forecast"
};

// Months
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
const weatherEndpoint = (city, choice, coords = {}) => {
    if (coords.latitude) {
        return `http://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&&appid=${api_key}`
    } else {
        const variant = urls[choice];
        return `http://api.openweathermap.org/data/2.5/${variant}?q=${city}&units=metric&&appid=${api_key}`
    }
};

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHTMLTemplate = (name, main, weather, wind, clouds, time) => (
    `🌇The weather in <b>${name}</b>:
  <b>${weather.main}</b> - ${weather.description}
  🌡️Temperature: <b>${main.temp} °C</b>
  🌡️Feels like: <b>${main.feels_like} °C</b>
  🌡️Max temperature: <b>${main.temp_max} °C</b>
  🌡️Min temperature: <b>${main.temp_min} °C</b>
  Pressure: <b>${main.pressure} hPa</b>
  💧Humidity: <b>${main.humidity} %</b>
  💨Wind: <b>${wind.speed} meter/sec</b>
  ☁️Clouds: <b>${clouds.all} %</b>
  📆Date: <b>${time}</b>
  `
);

// Function that gets the weather by the city name or coords
const getWeather = (chatId, city, choice, coords) => {
    const endpoint = weatherEndpoint(city, choice, coords);

    axios.get(endpoint).then((resp) => {
        let name = "",
            main = {},
            wind = {},
            weather = {},
            clouds = {},
            dt = 0,
            timezone = 0;
        if (choice === "now") {
            name = resp.data.name;
            main = resp.data.main;
            weather = resp.data.weather;
            wind = resp.data.wind;
            clouds = resp.data.clouds;
            dt = resp.data.dt;
            timezone = resp.data.timezone;
        } else {
            dt = resp.data.list[8].dt;
            main = resp.data.list[8].main;
            weather = resp.data.list[8].weather;
            wind = resp.data.list[8].wind;
            clouds = resp.data.list[8].clouds;
            name = resp.data.city.name;
            timezone = resp.data.city.timezone;
        };
        const time = convertTime(dt + timezone);
        bot.sendPhoto(chatId, weatherIcon(weather[0].icon));
        bot.sendMessage(
            chatId,
            weatherHTMLTemplate(name, main, weather[0], wind, clouds, time), {
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

// Convert time from timstamp to string
const convertTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const output = month + ' ' + day + ',' + year;
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + " " + output;
    return formattedTime;
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
  /tomorrow <b>city</b> - shows weather for tomorrow(after 24-27 hours) selected <b>city</b>
  /set <b>city</b> - sets in database selected <b>city</b>
  /w - shows weather for set <b>city</b> by /set command
  /location - get actual information in the city by geographical point
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
    getWeather(chatId, city, "now");
});

// Listener (handler) for telegram's /now event
bot.onText(/\/tomorrow (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const city = match.input.split(" ")[1];
    if (city === undefined) {
        bot.sendMessage(chatId, "Please provide city name");
        return;
    }
    getWeather(chatId, city, "tomorrow");
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
                getWeather(chatId, doc.city, "now");
                bot.sendMessage(chatId, "Weather for tommorow and now ⬇️");
                getWeather(chatId, doc.city, "tomorrow");
            } else {
                bot.sendMessage(chatId, `Can not find your information, ${msg.from.first_name}.\n\rPlease, type \/set [city] command.`);
            }
        })
        .catch((err) => {
            bot.sendMessage(chatId, `Sorry, but now function is not working.\n\rError: ${err}`);
        });
});

bot.onText(/\/location/, (msg) => {
    const opts = {
        reply_markup: JSON.stringify({
            keyboard: [
                [{ text: "Location", request_location: true }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }),
    };
    bot.sendMessage(msg.chat.id, "Send me location by button", opts);
});

bot.on("location", (msg) => {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;
    getWeather(chatId, "", "now", { latitude, longitude })
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const response = `
Hi!
Here you can see commands that you can type for this bot: 
/now <b>city_name</b> - get weather information in city
/tomorrow <b>city_name</b> - get weather information in city for tomorrow
/set <b>city_name</b> - set city information in database for quick access in getting forecast
/w - get weather information in city that you set in database for now and tomorrow
/help - look for available commands
/location - get actual information in the city by geographical point.
    `;

    bot.sendMessage(chatId, response, { parse_mode: "HTML" });
});

// Listen for any kind of message. There are different kinds of messages.
bot.on("text", (msg) => {
    const chatId = msg.chat.id;
    if (!msg.location) {
        if (msg.text.toLowerCase() === "hi" || msg.text.toLowerCase() === "hello") {
            let str = `Hello, ${msg.from.first_name}. I\'m bot for showing weather information by using [OpenWeatherMap](https://openweathermap.org/) API.\nMy creator is @sylvenis. Also my code is [here](https://github.com/mezgoodle/weather-bot).\nGood luck!😉`;
            bot.sendMessage(chatId, str, { parse_mode: "Markdown" });
        };
        if (msg.text.toLowerCase() === "bye") {
            bot.sendMessage(chatId, "Have a nice day, " + msg.from.first_name);
        };
    }
});

// Listen for errors
bot.on("polling_error", (err) => console.log(err));