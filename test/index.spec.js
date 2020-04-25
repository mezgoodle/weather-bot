const data = require("./data.json");
const { fetchData } = require("./util");

describe.each(data.current_weather)("Get weather info:", (city, expected) => {
    test("testing by country", () => {
        fetchData(city).then(data => {
            expect(data.sys.country).toEqual(expected);
        })
    });
});