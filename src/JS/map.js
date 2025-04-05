document.addEventListener("DOMContentLoaded", function () {
    let apiKey = "e05df82d22234b399b8113631253103";

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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
        
        // Actualizar contenido del popup con los datos de la zona
        document.getElementById('popup-title').innerText = `Información de la zona seleccionada`;
        document.getElementById('popup-island').innerText = properties.isla || "Desconocida";
        document.getElementById('popup-zone').innerText = properties.zona || "Desconocida";
        const coord = properties.coord.split(",");
        const lat = coord[1].trim();
        const lon = coord[0].trim();
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
        

        // Convertir coordenadas del mapa a posición en la pantalla
        let point = window.map.latLngToContainerPoint(event.latlng);
        popup.style.left = `${point.x + 280}px`;
        popup.style.top = `${point.y + 280}px`;
        popup.style.display = 'block';
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
