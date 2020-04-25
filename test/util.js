const axios = require("axios");
require("dotenv").config();
const api_key = process.env.API_KEY;
const fetchData = (city) => {
    return axios
        .get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${api_key}`)
        .then(response => {
            return response.data;
        });
};

exports.fetchData = fetchData;