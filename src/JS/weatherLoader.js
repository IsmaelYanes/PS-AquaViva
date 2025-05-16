class WeatherControl {
    constructor() {
        this.temperature = 0;
        this.windSpeed = 0;
        this.precipitation = 0;
        this.TEMPERATUREUMBRAL = 2;
        this.WINDSPEEDUMBRAL = 15;
        this.PRECIPITATIONUMBRAL = 5;
        this.forecastData = "";
        this.forescastMinTemperatures = [];
        this.forescastMaxTemperatures = [];
        this.forescastAverageTemperatures = [];
        this.forescastMaxWinds = [];
        this.totalPrecipitations = [];
        this.averageSwellHt = [];
        this.waterAverageTemperature = [];
    }

    async loadWeather(lat, lon) {
        const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${lat},${lon}`);
        const data = await response.json();
        this.forecastData = data.forecast.forecastday;
        this.updateTemperature(data.current.temp_c);
        this.updateWindSpeed(data.condition.wind_kph);
        this.updatePrecipitation(data.condition.precip_mm);
        this.loadForesCastWeatherInfo();
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

    loadForesCastWeatherInfo() {
        for (let i = 0; i < this.forecastData.length; i++) {
            this.forescastMaxTemperatures.push(this.forecastData[i].day.maxtemp_c);
            this.forescastAverageTemperatures.push(this.forecastData[i].day.avgtemp_c);
            this.forescastMinTemperatures.push(this.forecastData[i].day.mintemp_c);
            this.forescastMaxWinds.push(this.forecastData[i].maxwind_kph);
            this.totalPrecipitations.push(this.forecastData[i].totalprecip_mm);
            let avgTideForDay = 0;
            let avgWaterTemperature = 0;
            for (let j = 0; j < this.forecastData.hour; j++) {
                avgTideForDay += this.forecastData.hour[j].swell_ht_ft;
                avgWaterTemperature += this.forecastData.hour[j].water_temp_c;
            }
            this.averageSwellHt.push(avgTideForDay);
            this.waterAverageTemperature.push(avgWaterTemperature);
        }
    }
}