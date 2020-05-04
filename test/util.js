const axios = require("axios");
require("dotenv").config();
const api_key = process.env.API_KEY;
const urls = {
    now: "weather",
    tommorow: "forecast"
};
const fetchData = (city, variant) => {
    return axios
        .get(`http://api.openweathermap.org/data/2.5/${urls.variant}?q=${city}&units=metric&&appid=${api_key}`)
        .then(response => {
            return response.data;
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

module.exports = { fetchData, convertTime };