'use strict';

const axios = require("axios");
require("dotenv").config();
const api_key = process.env.API_KEY;
const token = process.env.TELEGRAM_TOKEN;
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
        .get(`https://api.telegram.org/bot${token}/${method}?chat_id=353057906&${data}`)
        .then(response => {
            return response.data;
        })
        .catch(err => console.log(err));
};

// Convert time from timstamp to string
const convertTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
};

module.exports = { fetchDataCity, fetchDataCoords, fetchAPITelegram, convertTime };