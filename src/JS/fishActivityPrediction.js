
class Solunar{
    constructor(date, lat, lon){
        this.date = date;
        this.lat = lat;
        this.lon = lon;
        this.init();
    }

    init(){
        this.moonTimes = SunCalc.getMoonTimes(this.date, this.lat, this.lon);
        this.moonrise = this.moonTimes.rise ? this.roundToMinutes(this.moonTimes.rise): null;
        this.moonset = this.moonTimes.set ? this.roundToMinutes(this.moonTimes.set): null;
    }

    roundToMinutes(date){
        return new Date(Math.round(date.getTime()/60000)*60000);
    }

    getHighestMoonTransit(){
        let maxAltitude = -Infinity;
        let transit = null;
        for (let h = 0; h<240; h++){
            const hour = this.getDateHour(h);
            const position = SunCalc.getMoonPosition(hour, this.lat, this.lon);
            if (position.altitude > maxAltitude){
                maxAltitude = position.altitude;
                transit = this.roundToMinutes(hour);
            }
        }
        return transit;
    }
    getDateHour(minutes){
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const date = new Date(this.date);
        date.setHours(h, m, 0, 0);
        return date;
    }

    getBothHighestMoonTransits(){
        const higherTransit = this.getHighestMoonTransit();
        const lowerTransit = this.sumMinutes(higherTransit, 744);
        return [higherTransit, lowerTransit];
    }

    getHighestMoonTransitsPeriod(){
        const transits = this.getBothHighestMoonTransits();
        return [{   higherInitTime: this.minusMinutes(transits[0], 60),
                    higherFinishTime: this.sumMinutes(transits[0], 60)
        },
                {   lowerInitTime: this.minusMinutes(transits[1], 60),
                    lowerFinishTime: this.sumMinutes(transits[1], 60)
                }
        ];
    }

    minusMinutes(date, minutes){
        return new Date(date.getTime() - minutes*60*1000)
    }

    sumMinutes(date, minutes){
        return new Date(date.getTime() + minutes*60*1000)
    }

    getBothMoonActivitiesTransitsPeriod(){
        return [{
            moonriseInitTime: this.minusMinutes(this.moonrise, 30),
            moonriseFinishTime: this.sumMinutes(this.moonrise, 30)
        },
            {
                moonsetInitTime: this.minusMinutes(this.moonset, 30),
                moonsetFinishTime: this.sumMinutes(this.moonset, 30)
            }];
    }
}


function convertToString(date){
    if (!date) return "No disponible";
    return date.getHours().toString().padStart(2, '0') + ":" +
        date.getMinutes().toString().padStart(2, '0');
}
function loadComponents(solunar){
    const highestTimes = solunar.getHighestMoonTransitsPeriod();
    const moonTimes = solunar.getBothMoonActivitiesTransitsPeriod();
    const highestInitTime = convertToString(highestTimes[0].higherInitTime);
    const highestFinishTime = convertToString(highestTimes[0].higherFinishTime);
    const lowerInitTime = convertToString(highestTimes[1].lowerInitTime);
    const lowerFinishTime = convertToString(highestTimes[1].lowerFinishTime);
    const moonriseInitTime = convertToString(moonTimes[0].moonriseInitTime);
    const moonriseFinishTime = convertToString(moonTimes[0].moonriseFinishTime);
    const moonsetInitTime = convertToString(moonTimes[1].moonsetInitTime);
    const moonsetFinishTime = convertToString(moonTimes[1].moonsetFinishTime);
    document.getElementById('highestTime').innerHTML = `De ${highestInitTime} a ${highestFinishTime}`;
    document.getElementById('lowerTime').innerHTML = `De ${lowerInitTime} a ${lowerFinishTime}`;
    document.getElementById('moonriseTime').innerHTML = `De ${moonriseInitTime} a ${moonriseFinishTime}`;
    document.getElementById('moonsetTime').innerHTML = `De ${moonsetInitTime} a ${moonsetFinishTime}`;
}



function loadPrediction(){
    const solunar = new Solunar(new Date(), lat, lon);
    loadComponents(solunar);
}

