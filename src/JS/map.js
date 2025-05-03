document.addEventListener("DOMContentLoaded", function () {
    let apiKey = "8b85f367751d4882aab231335250305";

    // Hacer el mapa global
    window.map = L.map('map', {
        center: [28.299, -16.413],
        zoom: 8,
        minZoom: 8,
        maxBounds: [
            [27.5, -18.5],
            [29.5, -13.0]
        ],
        maxBoundsViscosity: 1.0
    });

    // Capa base estándar
    window.defaultLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(window.map);

    fetch('../Data/zonas_litoral.json')
        .then(response => response.json())
        .then(geojsonData => {
            window.zonasLitoralLayer = L.geoJSON(geojsonData, {
                style: feature => ({
                    color: feature.properties.color || "blue",
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.4
                }),
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        layer.on('click', (e) => {
                            abrirPopup(feature.properties, e);
                        });
                    }
                }
            }).addTo(window.map);
        })
        .catch(error => console.error('Error al cargar el archivo zonas_litoral.json:', error));

    function abrirPopup(properties, event) {
        const popup = document.querySelector('.popup');


        // Ocultar el popup temporalmente para evitar que se desplace de forma incorrecta
        popup.style.display = 'none';

        // Actualizar contenido del popup con los datos de la zona
        document.getElementById('popup-title').innerText = `Información de la zona seleccionada`;
        document.getElementById('popup-island').innerText = properties.isla || "Desconocida";
        document.getElementById('popup-zone').innerText = properties.zona || "Desconocida";

        const coord = event.latlng;
        const lat = coord.lat;
        const lon = coord.lng;
        properties.description = getPrincipalData(lat, lon);

        document.getElementById("popup-link").href = `../HTML/MoreInfoPage.html?lat=${lat}&lon=${lon}`;

        // Manejo de la imagen
        const imgElement = document.getElementById('popup-image');
        if (properties.image) {
            imgElement.src = properties.image;
            imgElement.style.display = "block";
        } else {
            imgElement.style.display = "none";
        }


        // Pequeño retraso para recalcular el tamaño correcto antes de posicionar
        setTimeout(() => {
            popup.style.left = `${(window.innerWidth - popup.offsetWidth) / 2}px`;
            popup.style.top = `${(window.innerHeight - popup.offsetHeight) / 2}px`;

            // Mostrar el popup correctamente centrado
            popup.style.display = 'block';
        }, 10);
    }

    function getPrincipalData(lat, lon) {
        const jsonURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
        console.log(jsonURL);
        fetch (jsonURL, {
            method: "GET",
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => response.json())
            .then(json => {
                const icon = json.current.condition.icon;
                const temp = json.current.temp_c;
                const wind = json.current.wind_kph;
                const humidity = json.current.humidity;
                document.getElementById("temperature").innerHTML = `${temp}ºC`;
                document.getElementById("wind").innerHTML = `${wind}km/h`;
                document.getElementById("humidity").innerHTML = `${humidity}%`;
                document.getElementById("iconImg").src = icon;
            })
    }
});