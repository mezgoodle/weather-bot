const data = require("./data.json");
const { fetchDataCity, fetchDataCoords, convertTime } = require("./util");

describe.each(data.current_weather)("Getting weather info by city name:", (city, expected, coords) => {
    test("testing by country (now)", () => {
        fetchDataCity(city, "weather").then(data => {
            expect(data.sys.country).toEqual(expected);
        })
    });

    test("testing by country (tommorow)", () => {
        fetchDataCity(city, "forecast").then(data => {
            expect(data.city.country).toEqual(expected);
        })
    });

    test("testing by coords", () => {
        fetchDataCoords(coords.lat, coords.lon).then(data => {
            expect(data.sys.country).toEqual(expected);
        })
    });
});

describe.each(data.convert_time)("Converting time from timestamp:", (timestamp, expected) => {
    test("from timestamp to string", () => {
        expect(convertTime(timestamp)).toBe(expected);
    });
});