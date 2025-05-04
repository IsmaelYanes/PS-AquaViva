
function initializeSwellPage() {
    const currentDate = new Date();
    const swell = new Swell();
    swell.loadSwell().then(() => {
        const currentHour = currentDate.getHours();
        document.getElementById('currentHour').innerText = `${currentHour}:00`;
        document.getElementById('dateAndMonth').innerHTML = currentDate.toLocaleDateString();
        loadSwellInfoWithHourSelect(swell, currentHour);
        document.getElementById('addButton').addEventListener('click', (e) => {
            switchHour(swell, 1);
        })
        document.getElementById('restButton').addEventListener('click', (e) => {
            switchHour(swell, -1);
        })
    })
}


function switchHour(swell, index) {
    const currentText = document.getElementById('currentHour').innerText;
    const currentHour = parseInt(currentText.split(':')[0], 10);
    const hour = currentHour + index;
    if (hour < 0 || hour > 24) { return; }
    document.getElementById('currentHour').innerText = `${hour}:00`;
    loadSwellInfoWithHourSelect(swell, hour);
}


function loadSwellInfoWithHourSelect(swell, hour){
    document.getElementById("swellDirection").innerHTML = swell.getSwellDirectionByHour(hour) + " grado";
    document.getElementById("swellHeight").innerHTML = swell.getSwellHeightByHour(hour) + " metros";
    document.getElementById("swellPeriod").innerHTML = swell.getSwellPeriodByHour(hour) + " s";
    document.getElementById("pressure").innerHTML = swell.getSwellPressureByHour(hour) + " hPa";
    document.getElementById("waterTemperature").innerHTML = swell.getSwellWaterTemperatureByHour(hour) + "°C";
    document.getElementById("zoneName").innerHTML = swell.zoneName;

}




class Swell {
    constructor() {
        this.forecastDay = [];
        this.swellDataList = [];
        this.swellDataList = [];
        this.zoneName = '';
    }

    async loadSwell() {
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${lat},${lon}&days=${DAY}`);
            const data = await response.json();
            this.zoneName = data.location.name;
            this.foresCastDay = data.forecast.forecastday;
            const swellDataPerHour = data.forecast.forecastday[0].hour;
            this.convertSwellDataToArray(swellDataPerHour);
        } catch (error) {
            console.error('Hubo un problema de cargar dato de olas:', error);
        }
    }

    getSwellDirectionByHour(hour){
        return this.swellDataList[hour].swellDirection;
    }
    getSwellHeightByHour(hour){
        return this.swellDataList[hour].swellHeight;
    }
    getSwellPeriodByHour(hour){
        return this.swellDataList[hour].swellPeriod;
    }
    getSwellPressureByHour(hour){
        return this.swellDataList[hour].pressure;
    }
    getSwellWaterTemperatureByHour(hour){
        return this.swellDataList[hour].waterTemperature;
    }
    convertSwellDataToArray(swellDataPerHour) {
        for (let i = 0; i < swellDataPerHour.length; i++) {
            let swellInfo = {};
            swellInfo.swellDirection = swellDataPerHour[i].swell_dir;
            swellInfo.swellHeight = swellDataPerHour[i].sig_ht_mt;
            swellInfo.swellPeriod = swellDataPerHour[i].swell_period_secs;
            swellInfo.waterTemperature = swellDataPerHour[i].water_temp_c;
            swellInfo.pressure = swellDataPerHour[i].pressure_mb;
            this.swellDataList.push(swellInfo);
        }
    }
}