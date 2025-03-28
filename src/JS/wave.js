const KEY = "8eff48f079e44211b52124000251703";
const DAY = 7;
let coordinate = "28.771831683485686, -17.750202868741685"
let datesList = [];
let tidesData = [];

async function loadWaves() {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${coordinate}&days=${DAY}`);
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        const data = await response.json();
        let forecastData = data.forecast.forecastday;
        for (let i = 0; i < forecastData.length; i++) {
            datesList.push(forecastData[i].date);
            tidesData.push(forecastData[i].day.tides[0].tide);
        }
        loadButton(datesList);
        updateChart(0);
    } catch (error) {
        console.error('Hubo un problema:', error);
    }
}

function loadButton(dateList){
    const container = document.getElementById("selectTideDayButtonContainer");
    for (let i = 0; i < dateList.length; i++) {
        let button = document.createElement("button");
        button.innerText = dateList[i];
        button.id = "button" + i;
        button.onclick = function() {
            updateChart(i);
        }
        container.appendChild(button);
    }
}
loadWaves();

function prepareChartData(dayData) {
    const labels = dayData.map(tide => tide.tide_time);
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
        }]
    };
}

let tideChart;

function updateChart(dayIndex) {
    const currentDayData = tidesData[dayIndex];
    const chartData = prepareChartData(currentDayData);

    if (tideChart) {
        tideChart.data = chartData;
        tideChart.update();
    } else {
        const ctx = document.getElementById('tideChart').getContext('2d');
        tideChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                scales: {
                    x: {
                        min:0,
                        max:24,
                        title: {
                            display: true,
                            text: 'Hora del Día'
                        }
                    },
                    y: {
                        min: -0.5,
                        max:2.5,
                        title: {
                            display: true,
                            text: 'Altura de la Marea (m)'
                        }
                    }
                }
            }
        });
    }
}
