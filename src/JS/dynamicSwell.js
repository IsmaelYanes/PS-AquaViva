function initializeSwellPage() {
    const currentDate = new Date();
    const swell = new Swell();
    swell.loadSwell().then(() => {
        const currentHour = currentDate.getHours();
        updateHourCarousel(currentHour);
        document.getElementById('dateAndMonth').innerHTML = currentDate.toLocaleDateString();
        loadSwellInfoWithHourSelect(swell, currentHour);

        document.getElementById('addButton').addEventListener('click', (e) => {
            const currentActive = document.querySelector('.hour.active');
            const nextHour = parseInt(currentActive.dataset.hour) + 1;
            if (nextHour <= 24) {
                updateHourCarousel(nextHour);
                loadSwellInfoWithHourSelect(swell, nextHour);
            }
        });

        document.getElementById('restButton').addEventListener('click', (e) => {
            const currentActive = document.querySelector('.hour.active');
            const prevHour = parseInt(currentActive.dataset.hour) - 1;
            if (prevHour >= 0) {
                updateHourCarousel(prevHour);
                loadSwellInfoWithHourSelect(swell, prevHour);
            }
        });

        document.querySelectorAll('.hour').forEach(hourElement => {
            hourElement.addEventListener('click', (e) => {
                const selectedHour = parseInt(e.target.dataset.hour);
                updateHourCarousel(selectedHour);
                loadSwellInfoWithHourSelect(swell, selectedHour);
            });
        });
    });
}

function updateHourCarousel(selectedHour) {
    document.querySelectorAll('.hour').forEach(hour => {
        hour.classList.remove('active');
    });

    const hoursContainer = document.querySelector('.hours-container');
    hoursContainer.innerHTML = '';

    let startHour = Math.max(0, selectedHour - 2);
    let endHour = Math.min(24, selectedHour + 2);

    if (selectedHour <= 2) {
        endHour = Math.min(4, 24);
    } else if (selectedHour >= 22) {
        startHour = Math.max(20, 0);
    }

    for (let i = startHour; i <= endHour; i++) {
        const hourElement = document.createElement('span');
        hourElement.className = 'hour';
        hourElement.dataset.hour = i;
        hourElement.textContent = `${i}:00`;

        if (i === selectedHour) {
            hourElement.classList.add('active');
        }
        hoursContainer.appendChild(hourElement);
    }

    document.querySelectorAll('.hour').forEach(hourElement => {
        hourElement.addEventListener('click', (e) => {
            const clickedHour = parseInt(e.target.dataset.hour);
            updateHourCarousel(clickedHour);
            loadSwellInfoWithHourSelect(swell, clickedHour);
        });
    });
}

/*function switchHour(swell, index) {
    const currentText = document.getElementById('currentHour').innerText;
    const currentHour = parseInt(currentText.split(':')[0], 10);
    const hour = currentHour + index;
    if (hour < 0 || hour > 24) { return; }
    document.getElementById('currentHour').innerText = `${hour}:00`;
    loadSwellInfoWithHourSelect(swell, hour);
}*/


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