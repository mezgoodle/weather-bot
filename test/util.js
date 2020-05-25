'use strict';

const axios = require("axios");
require("dotenv").config();
const api_key = process.env.API_KEY;
const token = process.env.TELEGRAM_TOKEN;
const chat_id = process.env.CHAT_ID;
const fetchDataCity = (city, variant) => {
    return axios
        .get(`http://api.openweathermap.org/data/2.5/${variant}?q=${city}&units=metric&&appid=${api_key}`)
        .then(response => {
            return response.data;
        })
        .catch(err => console.log(err));
};

const fetchDataCoords = (lat, lon) => {
    return axios
        .get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&&appid=${api_key}`)
        .then(response => {
            return response.data;
        })
        .catch(err => console.log(err));
};

const fetchAPITelegram = (method, data) => {
    return axios
        .get(`https://api.telegram.org/bot${token}/${method}?chat_id=${chat_id}&${data}`)
        .then(response => {
            return response.data;
        })
        .catch(err => console.log(err));
};

module.exports = { fetchDataCity, fetchDataCoords, fetchAPITelegram };