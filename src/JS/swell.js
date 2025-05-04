
const DAY = 7;
let datesList = [];
let tidesData = [];
let sunrise = [];
let sunset = [];
let moonrise= [];
let moonset = [];




async function loadWaves() {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${lat},${lon}&days=${DAY}`);

        const data = await response.json();
        let forecastData = data.forecast.forecastday;
        for (let i = 0; i < forecastData.length; i++) {
            datesList.push(forecastData[i].date);
            tidesData.push(forecastData[i].day.tides[0].tide);
            sunrise.push(extractHoursToSunrise(forecastData[i].astro.sunrise));
            sunset.push(extractHoursToSunrise(forecastData[i].astro.sunset));
            moonrise.push(extractHoursToSunrise(forecastData[i].astro.moonrise));
            moonset.push(extractHoursToSunrise(forecastData[i].astro.moonset));
        }
    } catch (error) {
        console.error('Hubo un problema:', error);
    }

}
function loadButton(dateList){
    const container = document.getElementById("selectTideDayButtonContainer");
    container.innerHTML="";
    for (let i = 0; i < dateList.length; i++) {
        let button = document.createElement("button");
        button.innerText = dateList[i];
        button.id = "button" + i;
        button.onclick = function() {
            updateChart(i);
        }
        container.appendChild(button);
    }
    datesList = [];
}


function prepareChartData(dayData) {
    const labels = dayData.map(tide => extractHours(tide.tide_time));
    const heights = dayData.map(tide => tide.tide_height_mt);
    const pointColors = dayData.map(tide => tide.tide_type === 'HIGH' ? 'red' : 'blue');

    return {
        labels: labels,
        datasets: [{
            label: 'Altura de Marea (m)',
            data: heights,
            borderColor: 'blue',
            backgroundColor: '#A1E3F9',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: pointColors,
            pointRadius: 6,
            pointStyle: 'circle',
            pointBorderColor: pointColors,
            pointBorderWidth: 2
        }
        ],

    };
}

let tideChart;

function updateChart(dayIndex) {
    document.getElementById("sunriseTime").innerHTML = sunrise[dayIndex] + " AM";
    document.getElementById("sunsetTime").innerHTML = sunset[dayIndex] + " PM";
    document.getElementById("moonriseTime").innerHTML = moonrise[dayIndex] + " PM";
    document.getElementById("moonsetTime").innerHTML = moonset[dayIndex] + " AM";

    const currentDayData = tidesData[dayIndex];
    const chartData = prepareChartData(currentDayData);

    if (tideChart) {
        tideChart.destroy();
    }

    const ctx = document.getElementById('tideChart').getContext('2d');
    tideChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                x: {
                    min: 0,
                    max: 24,
                    title: {
                        display: true,
                        text: 'Hora del Día'
                    }
                },
                y: {
                    min: -1,
                    max: 2.5,
                    title: {
                        display: true,
                        text: 'Altura de la Marea (m)'
                    }
                }
            }
        }
    });
}

function extractHours(dateTimeStr) {
    const [date, time] = dateTimeStr.split(' ');
    return time;
}
function extractHoursToSunrise(dateTimeStr) {
    const [time, ap] = dateTimeStr.split(' ');
    return time;
}
function initWavePage(){
    reset();
    loadWaves().then(r=>{
        loadButton(datesList);
        updateChart(0);
    });
}
function reset(){
    datesList = [];
    tidesData = [];
    sunrise = [];
    sunset = [];
    moonrise= [];
    moonset = [];
}