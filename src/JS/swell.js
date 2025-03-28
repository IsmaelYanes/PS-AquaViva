let swellDataList = []
let coordinate = "28.771831683485686, -17.750202868741685"
let zoneName;
async function loadSwell() {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=8eff48f079e44211b52124000251703&q=${coordinate}&days=1`);
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

function loadHourButton(){
    let hoursList = document.getElementById('hoursList');
    hoursList.innerHTML = '';
    for (let i = 0; i < 24; i++) {
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerHTML = `${i}:00`;
        button.addEventListener('click', () => {selectTime(i);});
        li.appendChild(button);
        hoursList.appendChild(li);
    }
}

function selectTime(index) {
    const buttons = document.querySelectorAll('ul#hoursList li button');
    for (let i = 0; i < buttons.length; i++) {
        if (i === index) {
            buttons[i].style.backgroundColor = "#0056b3"
        }else{
            buttons[i].style.backgroundColor = "#007bff"
        }
    }
    let swellData = swellDataList[index];
    document.getElementById("swellDirection").innerHTML = swellData.swellDirection + " grado";
    document.getElementById("swellHeight").innerHTML = swellData.swellHeight + " metros";
    document.getElementById("swellPeriod").innerHTML = swellData.swellPeriod + " por segundo";
    document.getElementById("pressure").innerHTML = swellData.pressure + " hPa";
    document.getElementById("waterTemperature").innerHTML = swellData.waterTemperature + "°C";
    document.getElementById("zoneName").innerHTML = zoneName;

}


loadSwell().then(r => {
    loadHourButton();
    selectTime(new Date().getHours());
});
