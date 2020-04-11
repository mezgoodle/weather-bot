const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// replace the value below with the Telegram token you receive from @BotFather
const token = "YOUR_TELEGRAM_BOT_TOKEN";
// replace the value below with the OpenWeatherMap api_key you receive from their website
const api_key = "YOUR API_KEY HERE"

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/now [city]"
bot.onText(/\/now (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1];

    bot.sendMessage(chatId, city);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text.toString().toLowerCase().includes("hi") || msg.text.toString().toLowerCase().includes("hello")) {
        let str = `Hello, ${msg.from.first_name}. I\'m bot for showing weather information by using [OpenWeatherMap](https://openweathermap.org/) API.\nMy creator is @sylvenis. Also my code is [here](https://github.com/mezgoodle/weather-bot).\nGood luck!😉`
        bot.sendMessage(chatId, str, { parse_mode: "Markdown" });
    }
    if (msg.text.toString().toLowerCase().includes("bye")) {
        bot.sendMessage(chatId, "Have a nice day, " + msg.from.first_name);
    }
});

// Listen for errors
bot.on("polling_error", (err) => console.log(err));