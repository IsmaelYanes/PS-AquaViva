let swellDataList = []
let coordinate = "28.771831683485686, -17.750202868741685"
let zoneName;
async function obtenerOleaje() {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/marine.json?key=8eff48f079e44211b52124000251703&q=${coordinate}&days=1`);
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        zoneName = data.location.name;
        console.log(zoneName)
        let swellDataPerHour = data.forecast.forecastday[0].hour;
        for (let i = 0; i < swellDataPerHour.length; i++) {
            let swellInfo = {};
            swellInfo.swellDirection = swellDataPerHour[i].swell_dir;
            swellInfo.swellHeight = swellDataPerHour[i].sig_ht_mt;
            swellInfo.swellPeriod = swellDataPerHour[i].swell_period_secs;
            swellInfo.waterTemperature = swellDataPerHour[i].water_temp_c;
            swellInfo.pressure = swellDataPerHour[i].pressure_mb;
            swellDataList.push(swellInfo);
        }
    } catch (error) {
        console.error('Hubo un problema:', error);
    }
}

obtenerOleaje();
console.log(zoneName)
