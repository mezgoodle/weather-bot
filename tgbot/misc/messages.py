def weather_html_template(data, date, city):
    return f"""
🏠City: <b>{city}</b>
  ☝️️<b>{data.weather[0].main}</b> - {data.weather[0].description}
  🌅Sunrise: <b>{data.sunrise}</b>
  🌇Sunset: <b>{data.sunset}</b>
  🌡️Max temperature: <b>{data.temp.max} °C</b>
  🌡️Min temperature: <b>{data.temp.min} °C</b>
  🌡️Day temperature: <b>{data.temp.day} °C</b>
  🌡️Night temperature: <b>{data.temp.night} °C</b>
  🌡️Feels like: <b>{data.feels_like.day} °C</b>
  Pressure: <b>{data.pressure} hPa</b>
  💧Humidity: <b>{data.humidity} %</b>
  💨Wind: <b>{data.wind_speed} meter/sec</b>
  ☁️Clouds: <b>{data.clouds} %</b>
  📆Date: <b>{date}</b>
"""
