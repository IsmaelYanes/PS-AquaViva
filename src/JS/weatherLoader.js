class WeatherControl {
    static instance;

    constructor() {
        if (WeatherControl.instance) {
            return WeatherControl.instance;
        }

        this._temperature = 0;
        this._windSpeed = 0;
        this._precipitation = 0;
        this.TEMPERATUREUMBRAL = 2;
        this.WINDSPEEDUMBRAL = 15;
        this.PRECIPITATIONUMBRAL = 5;
        WeatherControl.instance = this;
    }

    static getInstance() {
        if (!WeatherControl.instance) {
            WeatherControl.instance = new WeatherControl();
        }
        return WeatherControl.instance;
    }

    async loadWeather(lat, lon) {
        let url = `https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${lat},${lon}&days=7&aqi=no&alerts=no`
        console.log(url)
        const response = await fetch(url);
        const data = await response.json();
        this.updateTemperature(data.current.temp_c);
        this.updateWindSpeed(data.current.wind_kph);
        this.updatePrecipitation(data.current.precip_mm);
    }

    notifyAlert(){

    }
    updateTemperature(temperature) {
        if (Math.abs(temperature - this._temperature) > this.TEMPERATUREUMBRAL && this._temperature !== 0) {
            this.notifyAlert();
        }
        this._temperature = temperature;
    };

    updatePrecipitation(precipitation) {
        if ( (precipitation - this._precipitation) > this.PRECIPITATIONUMBRAL && this._precipitation !== 0 ) {
            this.notifyAlert();
        }
        this._precipitation = precipitation;
    }

    updateWindSpeed(windSpeed) {
        if ( (windSpeed - this._windSpeed) > this.WINDSPEEDUMBRAL && this._windSpeed !== 0) {
            this.notifyAlert();
        }
        this._windSpeed = windSpeed;
    }


}


class MarineControl {
    constructor() {
        this.forecastData = "";
        this._forecastMinTemperatures = [];
        this._forecastMaxTemperatures = [];
        this._forecastAverageTemperatures = [];
        this._forecastMaxWinds = [];
        this._totalPrecipitations = [];
        this._averageSwellHt = [];
        this._waterAverageTemperature = [];
    }

    async loadMarineForecast(lat, lon) {
        let url = `https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${lat},${lon}&days=7`
        const response = await fetch(url);
        const data = await response.json();
        this.forecastData = data.forecast.forecastday;
        this.loadForesCastWeatherInfo();
    }

    loadForesCastWeatherInfo() {
        for (let i = 0; i < this.forecastData.length; i++) {
            this._forecastMaxTemperatures.push(this.forecastData[i].day.maxtemp_c);
            this._forecastAverageTemperatures.push(this.forecastData[i].day.avgtemp_c);
            this._forecastMinTemperatures.push(this.forecastData[i].day.mintemp_c);
            this._forecastMaxWinds.push(this.forecastData[i].day.maxwind_kph);
            this._totalPrecipitations.push(this.forecastData[i].day.totalprecip_mm);
            let avgTideForDay = 0;
            let avgWaterTemperature = 0;
            for (let j = 0; j < this.forecastData[i].hour.length; j++) {
                avgTideForDay += this.forecastData[i].hour[j].swell_ht_mt;
                avgWaterTemperature += this.forecastData[i].hour[j].water_temp_c;
            }
            this._averageSwellHt.push((avgTideForDay / 24).toFixed(2));
            this._waterAverageTemperature.push((avgWaterTemperature / 24).toFixed(2));
        }
    }

    getWaterAverageTemperature() {
        return this._waterAverageTemperature;
    }

    getForecastMaxWinds() {
        return this._forecastMaxWinds;
    }

    getAverageSwellHt() {
        return this._averageSwellHt;
    }

    getForecastMinTemperatures() {
        return this._forecastMinTemperatures;
    }

    getTotalPrecipitations() {
        return this._totalPrecipitations;
    }

    getForecastAverageTemperatures() {
        return this._forecastAverageTemperatures;
    }

    getForecastMaxTemperatures() {
        return this._forecastMaxTemperatures;
    }
    convertToJson(){
        return [
            {
                "Average Water Temperature (C)": this.getWaterAverageTemperature(),
                "Average Swell High (m)" : this.getAverageSwellHt(),
                "Average Temperature (C)": this.getForecastAverageTemperatures(),
                "Max Wind Speed (kmh)": this.getForecastMaxWinds(),
                "Precipitation (mm)" : this.getTotalPrecipitations(),
                "Max Temperature (C)": this.getForecastMaxTemperatures(),
                "Min Temperature (C)": this.getForecastMinTemperatures(),
            }
        ]
    }
}


function downloadExcel(weatherData) {
    const keys = Object.keys(weatherData);
    const length = weatherData[keys[0]].length;
    const rows = [];

    for (let i = 0; i < length; i++) {
        const row = {};
        keys.forEach(key => {
            row[key] = weatherData[key][i];
        });
        rows.push(row);
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pronóstico");

    XLSX.writeFile(workbook, "weather_forecast.xlsx");
}


function initDownloadWeatherTable(){
    const marineControl = new MarineControl();
    marineControl.loadMarineForecast(lat, lon).then(()=>{
        loadWeatherTable(marineControl.convertToJson()[0]);
        document.getElementById("downloadTableButton").addEventListener("click", ()=>{
            downloadExcel(marineControl.convertToJson()[0]);
        });
    })
}


function loadWeatherTable(weatherData){
    const table = document.getElementById("weatherTable");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    const headerRow = document.createElement("tr");
    const thParam = document.createElement("th");
    thParam.textContent = "Parámetro";
    headerRow.appendChild(thParam);

    const numDias = Object.values(weatherData)[0].length;
    for (let i = 0; i < numDias; i++) {
        const th = document.createElement("th");
        th.textContent = `Día ${i + 1}`;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    for (const parametro in weatherData) {
        const row = document.createElement("tr");
        const tdLabel = document.createElement("td");
        tdLabel.textContent = parametro;
        console.log(`${parametro}`);
        row.appendChild(tdLabel);

        weatherData[parametro].forEach(valor => {
            const td = document.createElement("td");
            td.textContent = valor
            row.appendChild(td);
        });

        tbody.appendChild(row);
    }
}

initDownloadWeatherTable();