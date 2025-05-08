console.log("FishByZone.js loaded");

function initFishByZoneGallery() {
    console.log("initFishByZoneGallery called");

    const fishGrid = document.getElementById('fish-info-grid');
    const zoneNameElement = document.getElementById('zone-name');

    if (!fishGrid || !zoneNameElement) {
        console.error("No se encontró el elemento #fish-info-grid o #zone-name");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");  // ID de playa desde la URL
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
                    const fishName = (fish.nom_commun || fish.name || '').toLowerCase();
                    if (fishList.some(f => f.toLowerCase() === fishName)) {
                        const fishItem = document.createElement('div');
                        fishItem.classList.add('fish-item');

                        const fishLink = document.createElement('a');
                        fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.nom_commun)}`;

                        const fishImage = document.createElement('img');
                        fishImage.alt = fish.nom_commun || fish.name;

                        // Verificar si la imagen existe
                        fishImage.onerror = () => {
                            fishImage.src = '../Images/default-fish.jpg';  // Imagen predeterminada si la imagen del pez no se carga
                        };
                        fishImage.src = fish.image; // Asignar la imagen del pez

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
        console.log("Buscando playa con ID:", beachId);  // Verificación adicional
        fetch('../Data/beach_fish_mapping.json')
            .then(response => {
                if (!response.ok) throw new Error(`Error al cargar beach_fish_mapping.json: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Datos de playas cargados:", data);  // Verificación de datos cargados
                const beach = data.beach_fish_mapping.find(b => b.beach_id === parseInt(beachId)); // Asegúrate de que `beachId` sea un número

                if (!beach) {
                    fishGrid.innerHTML = '<p>Error: Playa no encontrada para el ID proporcionado.</p>';
                    console.error("No se encontró la playa para el ID:", beachId);
                    return;
                }

                console.log("Playa encontrada:", beach.beach_name, "Peces:", beach.fish);
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
        // Lógica para coordenadas...
    }

    // ❌ CASO 3: No se proporcionó nada válido
    fishGrid.innerHTML = '<p>Error: No se proporcionaron parámetros válidos en la URL.</p>';
    console.error("Faltan parámetros id, lat o lon");
}

window.initFishByZoneGallery = initFishByZoneGallery;
