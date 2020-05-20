'use strict';

const { Telegraf } = require('telegraf');
// const express = require('express');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("./models/User");
const { token, api_key, dbURI } = require("./config");

// Storage of different urls for api queries
const urls = {
    now: "weather",
    tomorrow: "forecast"
};

// Connect to Mongo
mongoose.connect(dbURI, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.log(err));

const bot = new Telegraf(token);
// Create a bot that uses 'polling' to fetch new updates. It`s for development
// bot.launch();
// Create a bot that uses 'webhook' to get new updates. It`s for production ========
const BOT_URL = "https://weather-bot-mezgoodle.herokuapp.com";
bot.telegram.setWebhook(`${BOT_URL}/bot${token}`);
bot.startWebhook(`/bot${token}`, null, process.env.PORT);
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
const weatherHTMLTemplate = (name, main, weather, wind, clouds, time, variant) => (
    `🌇The weather in <b>${name} (${variant})</b>:
  <b>${weather.main}</b> - ${weather.description}
  🌡️Temperature: <b>${main.temp} °C</b>
  🌡️Feels like: <b>${main.feels_like} °C</b>
  🌡️Max temperature: <b>${main.temp_max} °C</b>
  🌡️Min temperature: <b>${main.temp_min} °C</b>
  Pressure: <b>${main.pressure} hPa</b>
  💧Humidity: <b>${main.humidity} %</b>
  💨Wind: <b>${wind.speed} meter/sec</b>
  ☁️Clouds: <b>${clouds.all} %</b>
  ⏰Time: <b>${time}</b>
  `
);

// Function that gets the weather by the city name or coords
const getWeather = (ctx, city, choice, coords) => {
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
        ctx.replyWithPhoto(weatherIcon(weather[0].icon));
        ctx.replyWithHTML(weatherHTMLTemplate(name, main, weather[0], wind, clouds, time, choice));
    }, (error) => {
        console.log("error", error);
        ctx.replyWithHTML(`Ooops...I couldn't be able to get weather for <b>${city}</b>`);
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
bot.start((ctx) => {
    ctx.replyWithHTML(
        `Welcome at <b>Weather Bot</b>, thank you for using my service
      
  Available commands:
  
  /now <b>city</b> - shows weather for selected <b>city</b>
  /tomorrow <b>city</b> - shows weather for tomorrow(after 24-27 hours) selected <b>city</b>
  /set <b>city</b> - sets in database selected <b>city</b>
  /w - shows weather for set <b>city</b> by /set command
  /location - get actual information in the city by geographical point
    `
    );
});

bot.on("text", (ctx) => {
    const first = ctx.message.text.split(" ")[0];
    const second = ctx.message.text.split(" ")[1];
    if (second === undefined) {
        ctx.reply("Please provide city name");
        return;
    }
    if (first === "/now" || first === "/now@weather_mezgoodle_bot") {
        getWeather(ctx, city, "now");
        return;
    };
    if (first === "/tomorrow" || first === "/tomorrow@weather_mezgoodle_bot") {
        getWeather(ctx, city, "tomorrow");
        return;
    };
    if (first === "/set" || first === "/set@weather_mezgoodle_bot") {
        User.findOneAndUpdate({ user_id }, { city }, (err, res) => {
            if (err) {
                ctx.reply(`Sorry, but now function is not working.\n\r Error: ${err}`);
            } else if (res === null) {
                const new_user = new User({
                    user_id,
                    city
                });
                new_user.save()
                    .then(() => ctx.reply(`${ctx.message.from.first_name}, your information has been saved`))
                    .catch(() => {
                        ctx.reply(`${ctx.message.from.first_name}, sorry, but something went wrong`);
                    });

            } else {
                ctx.reply(`${ctx.message.from.first_name}, your information has been updated`);
            }
            return;
        });
    };
});

// Listener (handler) for telegram's /w event
bot.command(["/w", "/w@weather_mezgoodle_bot"], (ctx) => {
    const user_id = ctx.message.from.id;
    User.findOne({ user_id })
        .then((doc) => {
            if (doc) {
                getWeather(ctx, doc.city, "now");
                ctx.reply("Weather for tommorow and now ⬇️");
                getWeather(ctx, doc.city, "tomorrow");
            } else {
                ctx.reply(`Can not find your information, ${ctx.from.first_name}.\n\rPlease, type \/set [city] command.`);
            }
        })
        .catch((err) => {
            ctx.reply(`Sorry, but now function is not working.\n\rError: ${err}`);
        });
});

bot.command(["/location", "/location@weather_mezgoodle_bot"], (ctx) => {
    return ctx.reply("Send me location by button", Extra.markup((markup) => {
        return markup.resize()
            .keyboard([
                markup.locationRequestButton('Send location')
            ])
            .oneTime()
    }));
});

bot.on("location", (ctx) => {
    const { latitude, longitude } = ctx.update.message.location;
    getWeather(ctx, "", "now", { latitude, longitude })
});

bot.command(["/help", "/help@weather_mezgoodle_bot"], (ctx) => ctx.replyWithHTML(`Hi!
    Here you can see commands that you can type
    for this bot:
    /now <b>city_name</b > -get weather information in city
    /tomorrow <b> city_name </b> - get weather information in city for tomorrow 
    /set <b> city_name </b> - set city information in database for quick access in getting forecast 
    /w - get weather information in city that you set in database for now and tomorrow 
    /help - look for available commands 
    /location - get actual information in the city by geographical point.
    `));

// Listen for greetings and farewell
bot.hears(["hello", "hi", "Hello", "Hi"], (ctx) => (ctx.replyWithMarkdown(`Hello, ${ctx.from.first_name}. I\'m bot for showing weather information by using [OpenWeatherMap](https://openweathermap.org/) API.\nMy creator is @sylvenis. Also my code is [here](https://github.com/mezgoodle/weather-bot).\nGood luck!😉`)));
bot.hears(["bye", "Bye"], (ctx) => (ctx.reply(`Have a nice day, ${ctx.from.first_name}`)));

// Listen for errors
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
})