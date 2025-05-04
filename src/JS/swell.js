
const DAY = 7;


function initWavePage(){
    const wave = new Wave();
    wave.init();
    const chart = new WaveChart();
    wave.loadWaves().then(() => {
        loadAllWavesInfoToComponents(wave, chart, wave.index)
        document.getElementById('addDay').addEventListener('click',function(){
            const resultIndex = wave.index + 1;
            if (resultIndex > wave.datesList.length ) { return;}
            wave.setIndex(resultIndex);
            loadAllWavesInfoToComponents(wave, chart);
        });
        document.getElementById('restDay').addEventListener('click', function (){
            const resultIndex = wave.index - 1;
            if (resultIndex < 0 ) { return;}
            wave.setIndex(resultIndex);
            loadAllWavesInfoToComponents(wave, chart);
        });
    })

}



function loadAllWavesInfoToComponents(wave, chart){
    chart.updateChart(wave.tidesData, wave.index);
    loadMoonAndSunTime(wave, wave.index);
}

function loadMoonAndSunTime(wave, dayIndex){
    document.getElementById("sunrise").innerHTML = wave.sunrise[dayIndex] + " AM";
    document.getElementById("sunset").innerHTML = wave.sunset[dayIndex] + " PM";
    document.getElementById("moonrise").innerHTML = wave.moonrise[dayIndex] + " PM";
    document.getElementById("moonset").innerHTML = wave.moonset[dayIndex] + " AM";
    document.getElementById("currentDay").innerHTML = wave.datesList[dayIndex];
}

class Wave {
    constructor() {}

    async loadWaves(){
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/marine.json?key=${KEY}&q=${lat},${lon}&days=${DAY}`);

            const data = await response.json();
            let forecastData = data.forecast.forecastday;
            for (let i = 0; i < forecastData.length; i++) {
                this.datesList.push(forecastData[i].date);
                this.tidesData.push(forecastData[i].day.tides[0].tide);
                this.sunrise.push(this.extractHoursToSunrise(forecastData[i].astro.sunrise));
                this.sunset.push(this.extractHoursToSunrise(forecastData[i].astro.sunset));
                this.moonrise.push(this.extractHoursToSunrise(forecastData[i].astro.moonrise));
                this.moonset.push(this.extractHoursToSunrise(forecastData[i].astro.moonset));
            }
        } catch (error) {
            console.error('Hubo un problema:', error);
        }
    }

    init(){
        this.index = 0;
        this.datesList = [];
        this.tidesData = [];
        this.sunrise = [];
        this.sunset = [];
        this.moonrise= [];
        this.moonset = [];
    }


    extractHoursToSunrise(dateTimeStr) {
        const [time, ap] = dateTimeStr.split(' ');
        return time;
    }

    setIndex(index){
        this.index = index;
    }
}

class WaveChart {
    constructor() {
        this.tideChart = null;
    }

    prepareChartData(dayData) {
        const labels = dayData.map(tide => this.extractHours(tide.tide_time));
        const heights = dayData.map(tide => tide.tide_height_mt);
        const pointColors = dayData.map(tide => tide.tide_type === 'HIGH' ? '#FF6363' : 'steelblue');
        return {
            labels: labels,
            datasets: [{
                label: 'Altura de Marea (m)',
                data: heights,
                borderColor: 'blue',
                backgroundColor: '#60B5FF',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: pointColors,
                pointRadius: 6,
                pointStyle: 'circle',
                pointBorderColor: pointColors,
                pointBorderWidth: 3
            }
            ],
        };
    }

    updateChart(tidesData, dayIndex) {
        const currentDayData = tidesData[dayIndex];
        const chartData = this.prepareChartData(currentDayData);

        if (this.tideChart) {
            this.tideChart.destroy();
        }

        const ctx = document.getElementById('tideChart').getContext('2d');
        this.tideChart = new Chart(ctx, {
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
    extractHours(dateTimeStr) {
        const [date, time] = dateTimeStr.split(' ');
        return time;
    }


}