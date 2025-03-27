document.addEventListener("DOMContentLoaded", function () {
    let map = L.map('map', {
        center: [28.299, -16.413],
        zoom: 8,
        minZoom: 8,
        maxBounds: [
            [27.5, -18.5],
            [29.5, -13.0]
        ],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetch('../Data/zonas_litoral.json')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJSON(geojsonData, {
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
            }).addTo(map);
        })
        .catch(error => console.error('Error al cargar el archivo zonas_litoral.json:', error));

    function abrirPopup(properties, event) {
        const popup = document.querySelector('.popup');

        // Actualizar contenido del popup con los datos de la zona
        document.getElementById('popup-title').innerText = `Información de la zona`;
        document.getElementById('popup-island').innerText = properties.isla || "Desconocida";
        document.getElementById('popup-zone').innerText = properties.zona || "Desconocida";
        document.getElementById('popup-info').innerText = properties.description || "Sin información disponible.";

        // Manejo de la imagen
        const imgElement = document.getElementById('popup-image');
        if (properties.image) {
            imgElement.src = properties.image;
            imgElement.style.display = "block";
        } else {
            imgElement.style.display = "none";
        }

        // Manejo del enlace "Ver más"
        const moreInfoLink = document.getElementById('popup-link');
        if (properties.moreInfoURL) {
            moreInfoLink.href = properties.moreInfoURL;
            moreInfoLink.style.display = "inline-block";
        } else {
            moreInfoLink.style.display = "none";
        }

        // Convertir coordenadas del mapa a posición en la pantalla
        let point = map.latLngToContainerPoint(event.latlng);
        popup.style.left = `${point.x + 280}px`;
        popup.style.top = `${point.y + 280}px`;
        popup.style.display = 'block';
    }
});
