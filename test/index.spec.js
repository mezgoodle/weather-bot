const data = require("./data.json");
const { fetchData, convertTime } = require("./util");

describe.each(data.current_weather)("Getting weather info:", (city, expected) => {
    test("testing by country (now)", () => {
        fetchData(city, "weather").then(data => {
            expect(data.sys.country).toEqual(expected);
        })
    });

    test("testing by country (tommorow)", () => {
        fetchData(city, "forecast").then(data => {
            expect(data.city.country).toEqual(expected);
        })
    });
});

describe.each(data.convert_time)("Converting time from timestamp:", (timestamp, expected) => {
    test("from timestamp to string", () => {
        expect(convertTime(timestamp)).toBe(expected);
    });
});