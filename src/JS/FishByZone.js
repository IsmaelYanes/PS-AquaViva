console.log("FishByZone.js loaded");

function initFishByZoneGallery() {
    console.log("initFishByZoneGallery called");
    const fishGrid = document.getElementById('fish-grid');
    const zoneNameElement = document.getElementById('zone-name');
    if (!fishGrid || !zoneNameElement) {
        console.error("No se encontró el elemento #fish-grid o #zone-name");
        fishGrid.innerHTML = '<p>Error: Elementos necesarios no encontrados.</p>';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");
    const lat = parseFloat(urlParams.get("lat"));
    const lon = parseFloat(urlParams.get("lon"));

    console.log(`FishByZone.js - URL parameters - id: ${beachId}, lat: ${lat}, lon: ${lon}`);

    // Function to render fish
    function renderFish(fishList, name) {
        zoneNameElement.textContent = name;
        if (fishList.length === 0) {
            fishGrid.innerHTML = '<p>No se encontraron peces en esta área.</p>';
            console.warn(`No fish assigned to ${name}`);
            return;
        }

        // Fetch fish details
        fetch('../Data/fullfish.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar fullfish.json: ${response.status}`);
                return response.json();
            })
            .then(fishData => {
                fishGrid.innerHTML = ''; // Clear grid
                fishData.forEach(fish => {
                    if (fishList.some(fishName => fishName.toLowerCase() === fish.nom_commun.toLowerCase())) {
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
                console.log(`Rendered ${fishList.length} fish for ${name}`);
            })
            .catch(error => {
                console.error('Error al cargar los peces:', error);
                fishGrid.innerHTML = '<p>Error al cargar los datos de los peces.</p>';
            });
    }

    // Case 1: Beach ID provided
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

    // Case 2: Coordinates provided
    if (!isNaN(lat) && !isNaN(lon)) {
        fetch('../Data/zonas_litoral.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar zonas_litoral.json: ${response.status}`);
                return response.json();
            })
            .then(zonesData => {
                let zone = zonesData.features.find(feature => {
                    const [featureLon, featureLat] = feature.properties.coord.split(',').map(coord => parseFloat(coord.trim()));
                    // Normalize to 4 decimal places
                    const normalizedLat = Math.round(lat * 10000) / 10000;
                    const normalizedLon = Math.round(lon * 10000) / 10000;
                    const normalizedFeatureLat = Math.round(featureLat * 10000) / 10000;
                    const normalizedFeatureLon = Math.round(featureLon * 10000) / 10000;
                    console.log(`Comparing - URL: (${normalizedLat}, ${normalizedLon}), Feature: (${normalizedFeatureLat}, ${normalizedFeatureLon}), Zone: ${feature.properties.name}`);
                    return Math.abs(normalizedFeatureLat - normalizedLat) < 0.0001 && Math.abs(normalizedFeatureLon - normalizedLon) < 0.0001;
                });

                if (!zone) {
                    fishGrid.innerHTML = '<p>Error: Zona no encontrada para las coordenadas proporcionadas.</p>';
                    console.error("No zone found for coordinates:", lat, lon);
                    console.log("Available zones:", zonesData.features.map(f => ({
                        coord: f.properties.coord,
                        id: f.id,
                        name: f.properties.name,
                        fish: f.properties.fish || []
                    })));
                    return;
                }

                console.log("Zone found:", zone.properties.name, "Fish:", zone.properties.fish);
                renderFish(zone.properties.fish, zone.properties.name);
            })
            .catch(error => {
                console.error('Error al cargar zonas_litoral.json:', error);
                fishGrid.innerHTML = '<p>Error al cargar los datos de la zona.</p>';
            });
    } else {
        fishGrid.innerHTML = '<p>Error: Coordenadas no proporcionadas o inválidas.</p>';
        console.error("Invalid lat or lon:", urlParams.get("lat"), urlParams.get("lon"));
    }
}

// Expose the function globally
window.initFishByZoneGallery = initFishByZoneGallery;