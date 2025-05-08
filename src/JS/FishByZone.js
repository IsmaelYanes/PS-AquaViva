console.log("FishByZone.js loaded");

function initFishByZoneGallery() {
    console.log("initFishByZoneGallery called");

    const fishGrid = document.getElementById('fish-info-grid');
    const zoneNameElement = document.getElementById('zone-name');

    if (!fishGrid || !zoneNameElement) {
        console.warn("Elementos #fish-info-grid o #zone-name no existen en este contexto. Saliendo.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");
    const lat = parseFloat(urlParams.get("lat"));
    const lon = parseFloat(urlParams.get("lon"));

    console.log(`URL parameters - id: ${beachId}, lat: ${lat}, lon: ${lon}`);

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
                fishGrid.innerHTML = '';
                fishData.forEach(fish => {
                    const fishName = (fish.nom_commun || fish.name || '').toLowerCase();
                    if (fishList.some(f => f.toLowerCase() === fishName)) {
                        const fishItem = document.createElement('div');
                        fishItem.classList.add('fish-item');

                        const fishLink = document.createElement('a');
                        fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.nom_commun)}`;

                        const fishImage = document.createElement('img');
                        fishImage.alt = fish.nom_commun || fish.name;
                        fishImage.onerror = () => {
                            fishImage.src = '../Images/default-fish.jpg';
                        };
                        fishImage.src = fish.image;

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
                    console.error("No se encontró la playa para el ID:", beachId);
                    return;
                }
                console.log(beach.fish);
                renderFish(beach.fish, beach.beach_name);
            })
            .catch(error => {
                console.error('Error al cargar beach_fish_mapping.json:', error);
                fishGrid.innerHTML = '<p>Error al cargar los datos de la playa.</p>';
            });
        return;
    }

    // 🟢 CASO 2: Coordenadas => Zona por polígono
    if (!isNaN(lat) && !isNaN(lon)) {
        fetch('../Data/zonas_litoral_reconstruido.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar zonas_litoral_reconstruido.json: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const point = [lon, lat]; // [lng, lat]
                let matchedZone = null;

                for (const feature of data.features) {
                    const polygon = feature.geometry.coordinates[0]; // Primer anillo del polígono
                    if (isPointInPolygon(point, polygon)) {
                        matchedZone = feature;
                        break;
                    }
                }

                if (matchedZone) {
                    const props = matchedZone.properties;
                    console.log(props.fish);
                    renderFish(props.fish, props.name);
                } else {
                    fishGrid.innerHTML = '<p>No se encontró ninguna zona correspondiente a estas coordenadas.</p>';
                    console.warn("Coordenadas no coinciden con ningún polígono.");
                }
            })
            .catch(error => {
                console.error('Error al cargar zonas:', error);
                fishGrid.innerHTML = '<p>Error al determinar zona por coordenadas.</p>';
            });
        return;
    }

    // ❌ CASO 3: No hay parámetros válidos
    fishGrid.innerHTML = '<p>Error: No se proporcionaron parámetros válidos en la URL.</p>';
    console.error("Faltan parámetros id, lat o lon");
}

// 🔁 Algoritmo de ray-casting para punto en polígono
function isPointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi + 0.00000001) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

window.initFishByZoneGallery = initFishByZoneGallery;
