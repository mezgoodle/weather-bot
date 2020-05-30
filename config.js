'use strict';

require('dotenv').config();
// replace the value below with the Telegram token you receive
// from @BotFather
const Token = process.env.TELEGRAM_TOKEN;
// replace the value below with the OpenWeatherMap api_key
// you receive from their website
const ApiKey = process.env.API_KEY;
// MongoDB database config
const dbURI = `mongodb+srv://mezgoodle:${process.env.DB_PASS}@weather-user-data-suiox.mongodb.net/test?retryWrites=true&w=majority`;
// Geocode api key
const GeoapiKey = process.env.GEOCODE;

module.exports = { Token, ApiKey, dbURI, GeoapiKey };
