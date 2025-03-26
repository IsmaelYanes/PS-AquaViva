const KEY = "8eff48f079e44211b52124000251703";


const fs = require('fs');
const data = fs.readFileSync('../weather.json', 'utf8');
const jsonData = JSON.parse(data);
let forecastData = jsonData.forecast.forecastday;
let datesList = [];
let tidesData = [];
for (let i = 0; i < forecastData.length; i++) {
    datesList.push(forecastData[i].date);
    tidesData.push(forecastData[i].day.tides[0].tide);

}

console.log(datesList);
console.log(tidesData);

