require("dotenv").config();
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;
// replace the value below with the OpenWeatherMap api_key you receive from their website
const api_key = process.env.API_KEY;
// MongoDB database config
const dbURI = `mongodb+srv://mezgoodle:${process.env.DB_PASS}@weather-user-data-suiox.mongodb.net/test?retryWrites=true&w=majority`;
// Geocode api key
const geo_api_key = process.env.GEOCODE;

module.exports = { token, api_key, dbURI, geo_api_key };