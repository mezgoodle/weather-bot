const axios = require("axios");

const fetchData = (city) => {
    return axios
        .get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${process.env.API_KEY}`)
        .then(response => {
            return response.data;
        });
};

exports.fetchData = fetchData;