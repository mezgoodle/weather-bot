const data = require("./data.json");
const { fetchData, convertTime } = require("./util");

describe.each(data.current_weather)("Get weather info:", (city, expected) => {
    test("testing by country", () => {
        fetchData(city).then(data => {
            expect(data.sys.country).toEqual(expected);
        })
    });
});

describe.each(data.convert_time)("Converting time from timestamp:", (timestamp, expected) => {
    test("from timestamp to string", () => {
        expect(convertTime(timestamp)).toBe(expected);
    });
});