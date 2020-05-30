'use strict';

const axios = require('axios');
require('dotenv').config();
const ApiKey = process.env.API_KEY;
const Token = process.env.TELEGRAM_TOKEN;
const ChatId = process.env.CHAT_ID;
const fetchDataCity = (city, variant) => axios
  .get(`http://api.openweathermap.org/data/2.5/${variant}?q=${city}&units=metric&&appid=${ApiKey}`)
  .then(response => response.data)
  .catch(err => console.log(err));

const fetchDataCoords = (lat, lon) => axios
  .get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&&appid=${ApiKey}`)
  .then(response => response.data)
  .catch(err => console.log(err));

const fetchAPITelegram = (method, data) => axios
  .get(`https://api.telegram.org/bot${Token}/${method}?chat_id=${ChatId}&${data}`)
  .then(response => response.data)
  .catch(err => console.log(err));

// Months
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
// Convert time from timstamp to string
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


module.exports = { fetchDataCity, fetchDataCoords, fetchAPITelegram, convertTime, convertDate };
