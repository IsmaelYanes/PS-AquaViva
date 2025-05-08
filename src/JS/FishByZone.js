console.log("FishByZone.js loaded");

function initFishByZoneGallery() {
    console.log("initFishByZoneGallery called");
    const fishGrid = document.getElementById('fish-grid');
    if (!fishGrid) {
        console.error("No se encontró el elemento #fish-grid");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const lat = parseFloat(urlParams.get("lat"));
    const lon = parseFloat(urlParams.get("lon"));

    console.log(`FishByZone.js - URL parameters - lat: ${lat}, lon: ${lon}`);

    if (isNaN(lat) || isNaN(lon)) {
        fishGrid.innerHTML = '<p>Error: Coordenadas no proporcionadas o inválidas.</p>';
        console.error("Invalid lat or lon:", urlParams.get("lat"), urlParams.get("lon"));
        return;
    }

    // Función para verificar si un punto está dentro de un polígono
    function pointInPolygon(point, polygon) {
        const [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    fetch('../Data/zonas_litoral_reconstruido.json')
        .then(response => {
            if (!response.ok) throw new Error(`Error al cargar zonas_litoral.json: ${response.status}`);
            return response.json();
        })
        .then(zonesData => {
            const point = [lon, lat];

            const zone = zonesData.features.find(feature => {
                if (!feature.geometry || feature.geometry.type !== "Polygon") return false;
                const polygon = feature.geometry.coordinates[0]; // Primer anillo del polígono
                return pointInPolygon(point, polygon);
            });

            if (!zone) {
                fishGrid.innerHTML = '<p>Error: Zona no encontrada para las coordenadas proporcionadas.</p>';
                console.error("No zone found for coordinates:", lat, lon);
                console.log("Available zones:", zonesData.features.map(f => ({
                    name: f.properties.name,
                    id: f.id
                })));
                return;
            }

            console.log("Zone found:", zone.properties.name, "Fish:", zone.properties.fish);

            const fishInZone = zone.properties.fish || [];

            if (fishInZone.length === 0) {
                fishGrid.innerHTML = '<p>No se encontraron peces en esta zona.</p>';
                console.warn("No fish assigned to zone:", zone.properties.name);
                return;
            }

            fetch('../Data/fullfish.json')
                .then(response => {
                    if (!response.ok) throw new Error(`Error al cargar fullfish.json: ${response.status}`);
                    return response.json();
                })
                .then(fishData => {
                    fishGrid.innerHTML = ''; // Limpiar grid
                    fishData.forEach(fish => {
                        if (fishInZone.some(fishName => fishName.toLowerCase() === fish.nom_commun.toLowerCase())) {
                            const fishItem = document.createElement('div');
                            fishItem.classList.add('fish-item');

                            const fishLink = document.createElement('a');
                            fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.nom_commun)}`;

                            const fishImage = document.createElement('img');
                            fishImage.src = fish.image;
                            fishImage.alt = fish.nom_commun || fish.name;

                            const fishName = document.createElement('h2');
                            fishName.textContent = fish.nom_commun || fish.name;

                            fishLink.appendChild(fishImage);
                            fishLink.appendChild(fishName);
                            fishItem.appendChild(fishLink);
                            fishGrid.appendChild(fishItem);
                        }
                    });
                    console.log(`Rendered ${fishInZone.length} fish for zone: ${zone.properties.name}`);
                })
                .catch(error => {
                    console.error('Error al cargar los peces:', error);
                    fishGrid.innerHTML = '<p>Error al cargar los datos de los peces.</p>';
                });
        })
        .catch(error => {
            console.error('Error al cargar zonas_litoral.json:', error);
            fishGrid.innerHTML = '<p>Error al cargar los datos de la zona.</p>';
        });
}

window.initFishByZoneGallery = initFishByZoneGallery;
