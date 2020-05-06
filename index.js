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

// Storage of different urls for api queries
const urls = {
    now: "weather",
    tomorrow: "forecast"
};

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
const weatherEndpoint = (city, choice) => {
    const variant = urls[choice];
    return `http://api.openweathermap.org/data/2.5/${variant}?q=${city}&units=metric&&appid=${api_key}`
};

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHTMLTemplate = (name, main, weather, wind, clouds, time, variant) => (
    `The weather in <b>${name} (${variant})</b>:
  <b>${weather.main}</b> - ${weather.description}
  Temperature: <b>${main.temp} °C</b>
  Pressure: <b>${main.pressure} hPa</b>
  Humidity: <b>${main.humidity} %</b>
  Wind: <b>${wind.speed} meter/sec</b>
  Clouds: <b>${clouds.all} %</b>
  Time: <b>${time}</b>
  `
);

// Function that gets the weather by the city name
const getWeather = (chatId, city, choice) => {
    const endpoint = weatherEndpoint(city, choice);

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
            weatherHTMLTemplate(name, main, weather[0], wind, clouds, time, choice), {
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
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

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

bot.onText(/\/help/, message => {
    const fromId = message.from.id;
    const response = `
Hi!
Here you can see commands that you can type for this bot: 
/now <b>city_name</b> - get weather information in city
/tomorrow <b>city_name</b> - get weather information in city for tomorrow
/set <b>city_name</b> - set city information in database for quick access in getting forecast
/w - get weather information in city that you set in database for now and tomorrow
/help - look for available commands.
    `;

    return bot.sendMessage(fromId, response, { parse_mode: "HTML" });
});

// Listen for errors
bot.on("polling_error", (err) => console.log(err));