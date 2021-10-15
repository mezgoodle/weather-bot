'use strict';

// Imports
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const { Token, ApiKey, dbURI, GeoapiKey } = require('./config');

// Months
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Connect to Mongo
mongoose.connect(dbURI, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Create a bot that uses 'webhook' to get new updates.
// const bot = new TelegramBot(Token, { polling: true });
const options = {
  webHook: {
    port: process.env.PORT
  }
};
const url = process.env.APP_URL || 'https://weather-bot-mezgoodle.herokuapp.com:443';
const bot = new TelegramBot(Token, options);
bot.setWebHook(`${url}/bot${Token}`);

// Convert time and date from timstamp to string
const convertTime = timestamp => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  const minutes = '0' + date.getMinutes();
  const seconds = '0' + date.getSeconds();
  const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime;
};

const convertDate = timestamp => {
  const date = new Date(timestamp * 1000);
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const output = month + ' ' + day + ',' + year;
  return output;
};

// OpenWeatherMap endpoint for getting weather by city name
const weatherEndpoint = (lat, lon, lang) => (`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${ApiKey}&units=metric&lang=${lang}`);

// URL that provides icon according to the weather
const weatherIcon = icon => `http://openweathermap.org/img/w/${icon}.png`;

// Template for weather response
const weatherHTMLTemplate = (data, date, city) => (
  `🏠City: <b>${city}</b>
  ☝️️<b>${data.weather[0].main}</b> - ${data.weather[0].description}
  🌅Sunrise: <b>${data.sunrise}</b>
  🌇Sunset: <b>${data.sunset}</b>
  🌡️Max temperature: <b>${data.temp.max} °C</b>
  🌡️Min temperature: <b>${data.temp.min} °C</b>
  🌡️Day temperature: <b>${data.temp.day} °C</b>
  🌡️Night temperature: <b>${data.temp.night} °C</b>
  🌡️Feels like: <b>${data.feels_like.day} °C</b>
  Pressure: <b>${data.pressure} hPa</b>
  💧Humidity: <b>${data.humidity} %</b>
  💨Wind: <b>${data.wind_speed} meter/sec</b>
  ☁️Clouds: <b>${data.clouds} %</b>
  📆Date: <b>${date}</b>
  `
);

// Function that gets the weather by the city name or coords
const getWeather = (chatId, lat, lng, lang = 'en', index, city) => {
  const endpoint = weatherEndpoint(lat, lng, lang);

  axios.get(endpoint).then(resp => {
    const { timezone_offset, daily } = resp.data;
    for (let i = index[0]; i <= index[1]; i++) {
      const date = convertDate(daily[i].dt + timezone_offset);
      daily[i].sunrise = convertTime(daily[i].sunrise + timezone_offset);
      daily[i].sunset = convertTime(daily[i].sunset + timezone_offset);
      bot.sendPhoto(chatId, 
                    weatherIcon(daily[i].weather[0].icon), 
                    { caption: weatherHTMLTemplate(daily[i], date, city), parse_mode: 'HTML' });
    }
  }, error => {
    console.log('error', error);
    bot.sendMessage(chatId,
      'Ooops...I couldn\'t be able to get weather for this <b>city</b>',
      { parse_mode: 'HTML' });
  });
};

// Listener (handler) for telegram's /start event
// Provide the list of available commands
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Welcome at <b>Weather Bot</b>, thank you for using my service
      
Available commands:
/now <b>city</b> - get weather information in city.
/tomorrow <b>city</b> - get weather information in city for tomorrow.
/week <b>city</b> - get weather information in city for 7 days.
/lang <b>lang_code</b> - set language information in database for
getting main weather info in native language
/set <b>city</b> - sets in database selected city.
/w - get weather information in city by language that you set in database for 3 days.
/location - get actual information in the city by geographical point.
/help - look for available commands
    `, { parse_mode: 'HTML' }
  );
});

// Listener (handler) for telegram's /set event
bot.onText(/\/set (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const user_id = msg.from.id;
  const city = match.input.split(' ')[1];
  if (city === undefined) {
    bot.sendMessage(chatId, 'Please provide city name');
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
        .then(() => bot.sendMessage(chatId,
          `${msg.from.first_name}, your information has been saved`))
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
  const lang = match.input.split(' ')[1];
  if (lang === undefined) {
    bot.sendMessage(chatId, 'Please provide lang code');
    return;
  }
  User.findOneAndUpdate({ user_id }, { lang }, (err, res) => {
    if (err) {
      bot.sendMessage(`Sorry, but now function is not working.\n\r Error: ${err}`);
    } else if (res === null) {
      bot.sendMessage(chatId, `${msg.from.first_name}, please first type /set command`);
    } else {
      bot.sendMessage(chatId, `${msg.from.first_name}, your language has been updated`);
    }
    return;
  });

});

const getInfo = (chatId, user_id, city, index) => {
  if (city) {
    axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${GeoapiKey}&pretty=1`).then(resp => {
      const { lat, lng } = resp.data.results[0].geometry;
      getWeather(chatId, lat, lng, null, index, city);
    }, error => {
      console.log('error', error);
      bot.sendMessage(chatId, 'Sorry, but now function is not working.');
    });
  } else {
    User.findOne({ user_id })
      .then(doc => {
        if (doc) {
          axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${doc.city}&key=${GeoapiKey}&pretty=1`).then(resp => {
            const { lat, lng } = resp.data.results[0].geometry;
            getWeather(chatId, lat, lng, doc.lang, index, doc.city);
          }, error => {
            console.log('error', error);
            bot.sendMessage(chatId, 'Sorry, but now function is not working.');
          });
        } else {
          bot.sendMessage(chatId,
            `Can not find your information.
            \n\rPlease, type /set [city] command.`);
        }
      })
      .catch(err => {
        bot.sendMessage(chatId, `Sorry, but now function is not working.\n\rError: ${err}`);
      });
  }
};

// Listener (handler) for telegram's /week event
bot.onText(/\/week (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(' ')[1];
  getInfo(chatId, null, city, [0, 7]);
});

// Listener (handler) for telegram's /now event
bot.onText(/\/now (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(' ')[1];
  getInfo(chatId, null, city, [0, 0]);
});

// Listener (handler) for telegram's /now event
bot.onText(/\/tomorrow (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const city = match.input.split(' ')[1];
  getInfo(chatId, null, city, [1, 1]);
});

// Listener (handler) for telegram's /w event
bot.onText(/\/w/, msg => {
  const chatId = msg.chat.id;
  const user_id = msg.from.id;
  getInfo(chatId, user_id, null, [0, 2]);
});

// Listener (handler) for location
bot.onText(/\/location/, msg => {
  const opts = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: 'Location', request_location: true }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  };
  bot.sendMessage(msg.chat.id, 'Send me location by button', opts);
});

// Listener (handler) for location message
bot.on('location', msg => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;
  getWeather(chatId, latitude, longitude, 'en', [0, 0], 'by coordinates');
});

// Listener (handler) for telegram's /help event
bot.onText(/\/help/, msg => {
  const chatId = msg.chat.id;
  const response = `
Hi!
Here you can see commands that you can type for this bot:
/now <b>city</b> - get weather information in city.
/tomorrow <b>city</b> - get weather information in city for tomorrow.
/week <b>city</b> - get weather information in city for 7 days.
/lang <b>lang_code</b> - set language information in database for
getting main weather info in native language
/set <b>city</b> - sets in database selected city.
/w - get weather information in city by language that you set in database for 3 days.
/location - get actual information in the city by geographical point.
/help - look for available commands

    `;
  bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
});

// Listen for any kind of message. There are different kinds of messages.
bot.on('text', msg => {
  const chatId = msg.chat.id;
  if (!msg.location) {
    if (msg.text.toLowerCase() === 'hi' || msg.text.toLowerCase() === 'hello') {
      const str = `Hello, ${msg.from.first_name}. I'm bot for showing weather information by using [OpenWeatherMap](https://openweathermap.org/) API.\nMy creator is @sylvenis. Also my code is [here](https://github.com/mezgoodle/weather-bot).\nGood luck!😉`;
      bot.sendMessage(chatId, str, { parse_mode: 'Markdown' });
    }
    if (msg.text.toLowerCase() === 'bye') {
      bot.sendMessage(chatId, 'Have a nice day, ' + msg.from.first_name);
    }
  }
});

// Listen for errors
bot.on('polling_error', err => console.log(err));
