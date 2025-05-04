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

    // Fetch zones data to find zone with fish
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

            const fishInZone = zone.properties.fish || [];

            if (fishInZone.length === 0) {
                fishGrid.innerHTML = '<p>No se encontraron peces en esta zona.</p>';
                console.warn("No fish assigned to zone:", zone.properties.name);
                return;
            }

            // Fetch fish details
            fetch('../Data/fish.json')
                .then(response => {
                    if (!response.ok) throw new Error(`Error al cargar fish.json: ${response.status}`);
                    return response.json();
                })
                .then(fishData => {
                    fishGrid.innerHTML = ''; // Clear grid
                    fishData.forEach(fish => {
                        if (fishInZone.includes(fish.name)) {
                            const fishItem = document.createElement('div');
                            fishItem.classList.add('fish-item');

                            const fishLink = document.createElement('a');
                            fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.name)}`;

                            const fishImage = document.createElement('img');
                            fishImage.src = fish.image;
                            fishImage.alt = fish.name;

                            const fishName = document.createElement('h2');
                            fishName.textContent = fish.name;

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

// Expose the function globally
window.initFishByZoneGallery = initFishByZoneGallery;