document.addEventListener("DOMContentLoaded", function() {
    let map = L.map('map', {
        center: [28.299, -16.413],
        zoom: 8,
        minZoom: 8, // Restringe el zoom para que no pueda alejarse más allá de 8
        maxBounds: [
            [27.5, -18.5], // Suroeste de Canarias
            [29.5, -13.0]  // Noreste de Canarias
        ],
        maxBoundsViscosity: 1.0
    });

    // Agregar capa base de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Cargar y mostrar polígonos desde un archivo GeoJSON
    fetch('../Data/zonas_litoral.json') // Asegúrate de que la ruta del archivo sea correcta
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
                    if (feature.properties && feature.properties.name) {
                        layer.on('click', () => {
                            abrirPopup(feature.properties);
                        });
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error al cargar el archivo zonas_litoral.json:', error));

// Función para abrir el popup con ViewMoreWindow.html
    function abrirPopup(properties) {
        const popupWindow = window.open('ViewMoreWindow.html', 'popup', 'width=600,height=400');
        popupWindow.onload = () => {
            popupWindow.document.getElementById('popup-title').innerText = properties.name;
            popupWindow.document.getElementById('popup-content').innerText = properties.description || "Sin descripción disponible.";
        };
    }
});