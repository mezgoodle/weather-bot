const data = require("./data.json");
const { fetchData } = require("./util");

describe.each(data.current_weather)("Get weather info:", (city, expected) => {
    test("Checking fetch data", () => {
        fetchData(city).then(data => {
            expect(data).toEqual(expected);
        });
    });
});