// Elimina el listener de DOMContentLoaded y encapsula la lógica en initWeather()
let lat;
let lon;
const apiKey = "e05df82d22234b399b8113631253103";
function initWeather() {
    const urlParams = new URLSearchParams(window.location.search);
    lat = urlParams.get("lat");
    lon = urlParams.get("lon");
    console.log(lat, lon);

    // Si no existen lat y lon, no se ejecuta nada
    if (!lat || !lon) return;

    const jsonURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
    console.log("Cargando clima desde:", jsonURL);
    getDataJson(jsonURL);
}

function getDataJson(url, retries = 3, delay = 1000) {
    fetch(url, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status}`);
            }
            return response.json();
        })
        .then(json => {
            // Información principal
            document.getElementById("place-text").textContent = json.location.name;
            document.getElementById("grados").textContent = Math.round(json.current.temp_c);
            document.getElementById("precipitation").textContent = json.current.precip_mm + " mm";
            document.getElementById("wind").textContent = json.current.wind_kph + " km/h";
            document.getElementById("humedad").textContent = json.current.humidity + "%";
            document.getElementById("weather-principal-icon").src = json.current.condition.icon;

            // Forecast 7 días
            let dayWeek = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
            let numDayWeek = new Date(json.location.localtime).getDay();
            let days = document.getElementsByClassName("day-week");
            for (let i = 0; i < days.length; i++) {
                days[i].textContent = dayWeek[(i + numDayWeek) % 7];
            }
            let temps = document.getElementsByClassName("temp-day");
            for (let i = 0; i < temps.length; i++) {
                temps[i].textContent = Math.round(json.forecast.forecastday[i].day.mintemp_c) + "º/" +
                    Math.round(json.forecast.forecastday[i].day.maxtemp_c) + "º";
                document.getElementById(`img-day${i}`).src = json.forecast.forecastday[i].day.condition.icon;
            }

            // Forecast por hora y actualización del estilo
            showWeatherData(json);

            // Última actualización
            document.getElementById("last-updated").textContent = "Última actualización: " + json.current.last_updated;
        })
        .catch(error => {
            console.error("Error al cargar datos del tiempo:", error);
            if (retries > 0) {
                console.warn(`Reintentando en ${delay} ms... (Intentos restantes: ${retries})`);
                setTimeout(() => getDataJson(url, retries - 1, delay * 2), delay);
            }
        });
}

function showWeatherData(json) {
    // hora actual
    const now = new Date();
    let currentHour = now.getHours();

    // Horas a mostrar hasta que termine el día
    const hoursRow = document.getElementById("hours-row");
    const weatherIconsRow = document.getElementById("weather-icons-hour");
    const temperatureRow = document.getElementById("temperature-hour");
    const windRow = document.getElementById("wind-hour");

    const firstInfo = document.getElementById("firstInfo");
    const secondInfo = document.getElementById("secondInfo");
    const thirdInfo = document.getElementById("thirdInfo");
    const fourthInfo = document.getElementById("fourthInfo");
    const fifthInfo = document.getElementById("fifthInfo");
    const sixthInfo = document.getElementById("sixthInfo");
    const seventhInfo = document.getElementById("seventhInfo");

    function fillTable(day) {
        let hour = 0;
        if (day === 0) {
            hour = currentHour;
        }

        const dayCeroInfo = json.forecast.forecastday[day];
        console.log(dayCeroInfo);
        for (let i = hour; i <= 23; i++) {
            let hourInfo = dayCeroInfo.hour[i];

            // Hora
            const hourCell = document.createElement("th");
            hourCell.textContent = i.toString().padStart(2, "0") + ":00";
            hoursRow.appendChild(hourCell);

            // Icono
            const iconCell = document.createElement("td");
            const iconImg = document.createElement("img");
            iconImg.src = hourInfo.condition.icon;
            iconCell.appendChild(iconImg);
            weatherIconsRow.appendChild(iconCell);

            // Temperatura
            const tempCell = document.createElement("td");
            tempCell.textContent = Math.round(hourInfo.temp_c) + "ºC";
            temperatureRow.appendChild(tempCell);

            // Viento
            const windCell = document.createElement("td");
            let flecha = classifyWindDirection(hourInfo.wind_dir);
            const arrow = document.createElement("div");
            arrow.textContent = flecha;
            arrow.style.display = "inline-flex";
            arrow.style.color = "dodgerblue";
            windCell.innerHTML = parseFloat(hourInfo.wind_kph).toFixed(1) + " km/h<br>";
            windCell.appendChild(arrow);
            windRow.appendChild(windCell);

            if (day === 0) {
                if (hour >= 21 || hour <= 8) {
                    // Noche
                    document.getElementById("background-video").src = "../Videos/nightSkyClearRecortado.mp4";
                } else {
                    // Día
                    document.getElementById("background-video").src = "../Videos/skyBlue.mp4";
                }
            }
        }
    }

    function clearTable() {
        hoursRow.textContent = "";
        weatherIconsRow.textContent = "";
        temperatureRow.textContent = "";
        windRow.textContent = "";
    }

    fillTable(0);
    firstInfo.style.backgroundColor = "#007bff";
    firstInfo.style.color = "#fff";

    firstInfo.addEventListener("click", () => { styleButtons(0, firstInfo); });
    secondInfo.addEventListener("click", () => { styleButtons(1, secondInfo); });
    thirdInfo.addEventListener("click", () => { styleButtons(2, thirdInfo); });
    fourthInfo.addEventListener("click", () => { styleButtons(3, fourthInfo); });
    fifthInfo.addEventListener("click", () => { styleButtons(4, fifthInfo); });
    sixthInfo.addEventListener("click", () => { styleButtons(5, sixthInfo); });
    seventhInfo.addEventListener("click", () => { styleButtons(6, seventhInfo); });

    function styleButtons(day, actual) {
        clearTable();
        fillTable(day);
        actual.style.backgroundColor = "#007bff";
        actual.style.color = "#fff";
        deleteStyle(day);
    }

    function deleteStyle(day) {
        const days = document.getElementsByClassName("buttonDay");
        for (let i = 0; i < days.length; i++) {
            if (day !== i) {
                days[i].style.backgroundColor = "";
                days[i].style.color = "";
            }
        }
    }

}

function classifyWindDirection(direction) {
    const directionMap = {
        "N": "↑", "NNE": "↗", "NE": "↗", "ENE": "↗",
        "E": "→", "ESE": "↘", "SE": "↘", "SSE": "↘",
        "S": "↓", "SSW": "↙", "SW": "↙", "WSW": "↙",
        "W": "←", "WNW": "↖", "NW": "↖", "NNW": "↖"
    };
    return directionMap[direction];
}