import aiohttp


class WeatherAPI:
    def __init__(self, token: str):
        self.session = aiohttp.ClientSession()
        self.base_url = 'https://api.openweathermap.org/data/2.5/onecall?lat=%s&lon=%s&exclude' \
                        f'=hourly,minutely&appid={token}&units=metric&lang=%s'

    async def get(self, lat: str, lon: str, lang: str = 'ua'):
        url = self.base_url % (lat, lon, lang)
        async with self.session.get(url) as response:
            return await response.json()

    async def post(self, url, data=None):
        async with self.session.post(url, data=data) as response:
            return await response.json()

    async def close(self):
        await self.session.close()


class GeoCodeAPI:
    def __init__(self, token: str):
        self.session = aiohttp.ClientSession()
        self.base_url = f'https://api.opencagedata.com/geocode/v1/json?q=%s&key={token}&pretty=1'

    async def get(self, city: str):
        url = self.base_url % city
        async with self.session.get(url) as response:
            return await response.json()

    async def close(self):
        await self.session.close()
