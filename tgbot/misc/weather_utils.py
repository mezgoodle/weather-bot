from datetime import datetime


def weather_template(data: dict, date: str, city: str) -> str:
    return f"""
🏠City: <b>{city}</b>
☝️️<b>{data['weather'][0]['main']}</b> - {data['weather'][0]['description']}
🌅Sunrise: <b>{data['sunrise']}</b>
🌇Sunset: <b>{data['sunset']}</b>
🌡️Max temperature: <b>{data['temp']['max']} °C</b>
🌡️Min temperature: <b>{data['temp']['min']} °C</b>
🌡️Day temperature: <b>{data['temp']['day']} °C</b>
🌡️Night temperature: <b>{data['temp']['night']} °C</b>
🌡️Feels like: <b>{data['feels_like']['day']} °C</b>
Pressure: <b>{data['pressure']} hPa</b>
💧Humidity: <b>{data['humidity']} %</b>
💨Wind: <b>{data['wind_speed']} meter/sec</b>
☁️Clouds: <b>{data['clouds']} %</b>
📆Date: <b>{date}</b>
"""


def weather_icon(icon: str) -> str:
    return f"http://openweathermap.org/img/w/{icon}.png"


def convert_date(timestamp: float) -> str:
    date = datetime.fromtimestamp(timestamp)
    month = date.strftime("%B")
    day = date.day
    year = date.year
    return f'{month} {day}, {year}'


def convert_time(timestamp: float) -> str:
    date = datetime.fromtimestamp(timestamp)
    hours = date.hour
    minutes = date.minute
    seconds = date.second
    return f'{hours}:{minutes}:{seconds}'
