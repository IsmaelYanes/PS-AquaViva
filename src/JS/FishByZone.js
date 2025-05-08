console.log("FishByZone.js loaded");

function initFishByZoneGallery() {
    console.log("initFishByZoneGallery called");

    const fishGrid = document.getElementById('fish-info-grid');
    const zoneNameElement = document.getElementById('zone-name');

    if (!fishGrid || !zoneNameElement) {
        console.error("No se encontró el elemento #fish-grid o #zone-name");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");
    const lat = parseFloat(urlParams.get("lat"));
    const lon = parseFloat(urlParams.get("lon"));

    console.log(`URL parameters - id: ${beachId}, lat: ${lat}, lon: ${lon}`);

    // Función auxiliar para renderizar peces
    function renderFish(fishList, name) {
        zoneNameElement.textContent = name;

        if (!fishList || fishList.length === 0) {
            fishGrid.innerHTML = '<p>No se encontraron peces en esta área.</p>';
            console.warn(`No fish assigned to ${name}`);
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
                    if (fishList.some(f => f.toLowerCase() === fish.nom_commun.toLowerCase())) {
                        const fishItem = document.createElement('div');
                        fishItem.classList.add('fish-item');

                        const fishLink = document.createElement('a');
                        fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.nom_commun)}`;

                        const fishImage = document.createElement('img');
                        fishImage.src = fish.image;
                        fishImage.alt = fish.nom_commun || fish.name;

                        const fishNameEl = document.createElement('h2');
                        fishNameEl.textContent = fish.nom_commun || fish.name;

                        fishLink.appendChild(fishImage);
                        fishLink.appendChild(fishNameEl);
                        fishItem.appendChild(fishLink);
                        fishGrid.appendChild(fishItem);
                    }
                });
                console.log(`Rendered ${fishList.length} fish for ${name}`);
            })
            .catch(error => {
                console.error('Error al cargar los peces:', error);
                fishGrid.innerHTML = '<p>Error al cargar los datos de los peces.</p>';
            });
    }

    // 🟡 CASO 1: Si hay ID de playa
    if (beachId) {
        fetch('../Data/beach_fish_mapping.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar beach_fish_mapping.json: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const beach = data.beach_fish_mapping.find(b => b.beach_id === parseInt(beachId));
                if (!beach) {
                    fishGrid.innerHTML = '<p>Error: Playa no encontrada para el ID proporcionado.</p>';
                    console.error("No beach found for ID:", beachId);
                    return;
                }
                console.log("Beach found:", beach.beach_name, "Fish:", beach.fish);
                renderFish(beach.fish, beach.beach_name);
            })
            .catch(error => {
                console.error('Error al cargar beach_fish_mapping.json:', error);
                fishGrid.innerHTML = '<p>Error al cargar los datos de la playa.</p>';
            });
        return;
    }

    // 🟢 CASO 2: Coordenadas => Zona por polígono (ray-casting)
    if (!isNaN(lat) && !isNaN(lon)) {
        function pointInPolygon(point, polygon) {
            const [x, y] = point;
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i][0], yi = polygon[i][1];
                const xj = polygon[j][0], yj = polygon[j][1];

                const intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / ((yj - yi) + 1e-10) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        fetch('../Data/zonas_litoral_reconstruido.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar zonas_litoral_reconstruido.json: ${response.status}`);
                return response.json();
            })
            .then(zonesData => {
                const point = [lon, lat];

                const zone = zonesData.features.find(feature => {
                    if (!feature.geometry || feature.geometry.type !== "Polygon") return false;
                    const polygon = feature.geometry.coordinates[0];
                    return pointInPolygon(point, polygon);
                });

                if (!zone) {
                    fishGrid.innerHTML = '<p>Error: Zona no encontrada para las coordenadas proporcionadas.</p>';
                    console.error("No zone found for coordinates:", lat, lon);
                    return;
                }

                console.log("Zone found:", zone.properties.name, "Fish:", zone.properties.fish);
                renderFish(zone.properties.fish || [], zone.properties.name);
            })
            .catch(error => {
                console.error('Error al cargar zonas_litoral_reconstruido.json:', error);
                fishGrid.innerHTML = '<p>Error al cargar los datos de la zona.</p>';
            });
        return;
    }

    // ❌ CASO 3: No se proporcionó nada válido
    fishGrid.innerHTML = '<p>Error: No se proporcionaron parámetros válidos en la URL.</p>';
    console.error("Faltan parámetros id, lat o lon");
}

window.initFishByZoneGallery = initFishByZoneGallery;
