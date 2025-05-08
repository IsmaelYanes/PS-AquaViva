// MoreInfoPage.js

window.addEventListener('DOMContentLoaded', function() {
    // Obtener parámetros de latitud y longitud desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const lat = parseFloat(urlParams.get('lat'));
    const lon = parseFloat(urlParams.get('lon'));

    console.log("Latitud:", lat, "Longitud:", lon);

    // Llamar a la función para cargar los peces de la zona
    if (!isNaN(lat) && !isNaN(lon)) {
        loadFishByZone(lat, lon);
    } else {
        console.warn("Coordenadas inválidas");
    }
});

function loadFishByZone(lat, lon) {
    const fishGrid = document.getElementById("fishGrid");
    const zoneNameElement = document.getElementById("zoneName");

    if (lat && lon) {
        fetchZoneFish(lat, lon, fishGrid, zoneNameElement);
    } else {
        fishGrid.innerHTML = '<p>Coordenadas inválidas.</p>';
    }
}

function fetchZoneFish(lat, lon, fishGrid, zoneNameElement) {
    fetch('../Data/zonas_litoral.json')  // Ruta de tu archivo GeoJSON
        .then(response => {
            if (!response.ok) throw new Error(`Error al cargar zonas_litoral.json: ${response.status}`);
            return response.json();
        })
        .then(zonaData => {
            console.log("Datos de zonas:", zonaData);
            const point = turf.point([lon, lat]);
            let matchedZone = null;

            // Buscar la zona que contiene las coordenadas
            for (const feature of zonaData.features) {
                const polygon = turf.polygon(feature.geometry.coordinates);
                if (turf.booleanPointInPolygon(point, polygon)) {
                    matchedZone = feature;
                    break;
                }
            }

            if (!matchedZone) {
                console.warn("No se encontró zona para las coordenadas:", lat, lon);
                fishGrid.innerHTML = '<p>No se encontró una zona correspondiente para estas coordenadas.</p>';
                return;
            }

            // Mostrar nombre de la zona y cargar los peces
            const zoneName = matchedZone.properties.name || `${matchedZone.properties.isla} - ${matchedZone.properties.zona}`;
            const fishList = matchedZone.properties.fish || [];

            if (fishList.length === 0) {
                fishGrid.innerHTML = '<p>No se encontraron peces en esta zona.</p>';
                return;
            }

            zoneNameElement.textContent = zoneName;
            fetchFishDetails(fishList, fishGrid, zoneName, "zona");
        })
        .catch(error => {
            console.error("Error al cargar zonas_litoral.json o procesar las zonas:", error);
            fishGrid.innerHTML = '<p>Error al procesar las zonas.</p>';
        });
}

function fetchFishDetails(fishList, fishGrid, zoneName, type) {
    // Este es un ejemplo simple, puedes ampliarlo según cómo se manejen los detalles de los peces
    fishGrid.innerHTML = '';  // Limpiar el grid antes de agregar nuevos peces
    fishList.forEach(fish => {
        const fishItem = document.createElement("div");
        fishItem.classList.add("fish-item");
        fishItem.textContent = fish;  // Asegúrate de que los peces tengan detalles
        fishGrid.appendChild(fishItem);
    });
}
