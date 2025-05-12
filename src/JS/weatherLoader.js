class WeatherControl {
    constructor() {
        this.temperature = 0;
        this.windSpeed = 0;
        this.precipitation = 0;
        this.TEMPERATUREUMBRAL = 2;
        this.WINDSPEEDUMBRAL = 15;
        this.PRECIPITATIONUMBRAL = 5;

    }

    async loadWeather(lat, lon) {
        const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${lat},${lon}`);
        const data = await response.json();
        this.updateTemperature(data.current.temp_c);
        this.updateWindSpeed(data.condition.wind_kph);
        this.updatePrecipitation(data.condition.precip_mm);
    }

    notifyAlert(){

    }
    updateTemperature(temperature) {
        if (Math.abs(temperature - this.temperature) > this.TEMPERATUREUMBRAL && this.temperature !== 0) {
            this.notifyAlert();
        }
        this.temperature = temperature;
    };

    updatePrecipitation(precipitation) {
        if ( (precipitation - this.precipitation) > this.PRECIPITATIONUMBRAL && this.precipitation !== 0 ) {
            this.notifyAlert();
        }
        this.precipitation = precipitation;
    }

    updateWindSpeed(windSpeed) {
        if ( (windSpeed - this.windSpeed) > this.WINDSPEEDUMBRAL && this.windSpeed !== 0) {
            this.notifyAlert();
        }
        this.windSpeed = windSpeed;
    }
}