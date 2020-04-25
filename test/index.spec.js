const axios = require("axios");
const data = require("./data.json");

jest.mock("axios");

describe.each(data.current_weather)("Get weather info:", (city, expected) => {
    let response;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&&appid=${process.env.API_KEY}`
    beforeEach(() => {
        response = {
            data: expected
        }
    })

    test("Checking fetch data", () => {
        axios.get.mockReturnValue(response);

        return axios.get(url).then(data => {
            expect(data).toEqual(expected)
        })
    });
});