'use strict';

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("./models/User");
const { token, api_key, dbURI, geo_api_key } = require("./config");

// Months
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Connect to Mongo
mongoose.connect(dbURI, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.log(err));

// Create a bot that uses 'polling' to fetch new updates. It`s for development
const bot = new TelegramBot(token, { polling: true });
// Create a bot that uses 'webhook' to get new updates. It`s for production ========
// const options = {
//     webHook: {
//         port: process.env.PORT
//     }
// };
// const url = process.env.APP_URL || "https://weather-bot-mezgoodle.herokuapp.com:443";
// const bot = new TelegramBot(token, options);
// bot.setWebHook(`${url}/bot${token}`);
// =============

// OpenWeatherMap endpoint for getting weather by city name
const weatherEndpoint = (lat, lon, lang) => (`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${api_key}&units=metric&lang=${lang}`);

// URL that provides icon according to the weather
const weatherIcon = (icon) => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHTMLTemplate = (sunrise, sunset, temp, feels_like, pressure, humidity, weather, wind, clouds, date) => (
    `☝️<b>${weather.main}</b> - ${weather.description}
  🌅Sunrise: <b>${sunrise}</b>
  🌇Sunset: <b>${sunset}</b>
  🌡️Max temperature: <b>${temp.max} °C</b>
  🌡️Min temperature: <b>${temp.min} °C</b>
  🌡️Day temperature: <b>${temp.day} °C</b>
  🌡️Night temperature: <b>${temp.night} °C</b>
  🌡️Feels like: <b>${feels_like.day} °C</b>
  Pressure: <b>${pressure} hPa</b>
  💧Humidity: <b>${humidity} %</b>
  💨Wind: <b>${wind} meter/sec</b>
  ☁️Clouds: <b>${clouds} %</b>
  📆Date: <b>${date}</b>
  `
);

// Function that gets the weather by the city name or coords
const getWeather = (chatId, lat, lng, lang = "en") => {
    const endpoint = weatherEndpoint(lat, lng, lang);

    axios.get(endpoint).then((resp) => {
        let { timezone_offset, daily } = resp.data;
        for (let i = 0; i <= 3; i++) {
            let { dt, sunrise, sunset, temp, feels_like, pressure, humidity, wind_speed, weather, clouds } = daily[i];
            const date = convertDate(dt + timezone_offset);
            sunrise = convertTime(sunrise + timezone_offset);
            sunset = convertTime(sunset + timezone_offset);
            bot.sendPhoto(chatId, weatherIcon(weather[0].icon));
            bot.sendMessage(
                chatId,
                weatherHTMLTemplate(sunrise, sunset, temp, feels_like, pressure, humidity, weather[0], wind_speed, clouds, date), {
                    parse_mode: "HTML"
                }
            );
        }
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

// Convert time and date from timstamp to string
const convertTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
};

const convertDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const output = month + ' ' + day + ',' + year;
    return output;
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

// Listener (handler) for telegram's /lang event
bot.onText(/\/lang (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const user_id = msg.from.id;
    const lang = match.input.split(" ")[1];
    if (lang === undefined) {
        bot.sendMessage(chatId, "Please provide lang code");
        return;
    }
    User.findOneAndUpdate({ user_id }, { lang }, (err, res) => {
        if (err) {
            bot.sendMessage(`Sorry, but now function is not working.\n\r Error: ${err}`);
        } else if (res === null) {
            bot.sendMessage(chatId, `${msg.from.first_name}, please first type /set command`);
        } else {
            bot.sendMessage(chatId, `${msg.from.first_name}, your information has been updated`);
        }
        return;
    });

});

const getInfo = (chatId, user_id, city) => {
    if (city) {
        axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${geo_api_key}&pretty=1`).then((resp) => {
            let { lat, lng } = resp.data.results[0].geometry;
            getWeather(chatId, lat, lng);
        }, (error) => {
            console.log("error", error);
            bot.sendMessage(chatId, `Sorry, but now function is not working.`);
        });
    } else {
        User.findOne({ user_id })
            .then((doc) => {
                if (doc) {
                    axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${doc.city}&key=${geo_api_key}&pretty=1`).then((resp) => {
                        let { lat, lng } = resp.data.results[0].geometry;
                        getWeather(chatId, lat, lng, doc.lang);
                    }, (error) => {
                        console.log("error", error);
                        bot.sendMessage(chatId, `Sorry, but now function is not working.`);
                    });
                } else {
                    bot.sendMessage(chatId, `Can not find your information, ${msg.from.first_name}.\n\rPlease, type \/set [city] command.`);
                }
            })
            .catch((err) => {
                bot.sendMessage(chatId, `Sorry, but now function is not working.\n\rError: ${err}`);
            });
    }
};

// Listener (handler) for telegram's /w event
bot.onText(/\/w (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const city = match.input.split(" ")[1];
    getInfo(chatId, null, city);
});

// Listener (handler) for telegram's /w event
bot.onText(/\/weather/, (msg) => {
    const chatId = msg.chat.id;
    const user_id = msg.from.id;
    getInfo(chatId, user_id, null);
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
    getWeather(chatId, latitude, longitude, "en");
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