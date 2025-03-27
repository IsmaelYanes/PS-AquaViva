function toggleToolbar() {
    let toolbar = document.getElementById("toolbar");
    let content = document.getElementById("toolbar-content");

    toolbar.classList.toggle("expanded");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "flex";
    } else {
        content.style.display = "none";
    }
}

let satelliteLayer;
let isSatelliteView = false;
let beachMarkers = [];
let isBeachViewActive = false;
let zonasLitoralLayer;

function showLocation() {
    alert("Mostrando ubicación actual");
}

function addToFavorites() {
    alert("Agregado a favoritos");
}

function measureDistance() {
    alert("Midiendo distancia");
}

function defineZone() {
    alert("Definiendo zona");
}

async function showBeaches() {
    if (!window.map) {
        console.error("❌ El mapa aún no está disponible.");
        return;
    }

    if (isBeachViewActive) {
        console.log("🔄 Restaurando zonas litoral y eliminando marcadores de playas...");

        beachMarkers.forEach(marker => window.map.removeLayer(marker));
        beachMarkers = [];

        if (window.zonasLitoralLayer) {
            window.zonasLitoralLayer.addTo(window.map);
        }

        isBeachViewActive = false;
        return;
    }

    try {
        console.log("📡 Solicitando datos de playas desde Firebase...");

        const response = await fetch("https://firestore.googleapis.com/v1/projects/playascanarias-f83a8/databases/(default)/documents/playas");
        const data = await response.json();

        if (!data.documents) {
            console.error("❌ No se encontraron datos de playas en Firebase.");
            return;
        }

        console.log(`✅ Datos de playas obtenidos: ${data.documents.length}`);

        if (window.zonasLitoralLayer) {
            window.map.removeLayer(window.zonasLitoralLayer);
        }

        // 📍 Procesar cada playa y agregar marcador
        data.documents.forEach((doc, index) => {
            let fields = doc.fields;

            let lat = fields.LAT ? parseFloat(fields.LAT.stringValue || fields.LAT.doubleValue) : null;
            let lng = fields.LOG ? parseFloat(fields.LOG.stringValue || fields.LOG.doubleValue) : null;

            if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
                console.warn(`⚠️ Coordenadas inválidas para la playa ${fields.beachName?.stringValue || "Desconocida"} (ID: ${doc.name})`);
                return;
            }

            console.log(`🎯 Coordenadas procesadas para Playa ${index + 1}: LAT=${lat}, LNG=${lng}`);

            let marker = L.marker([lat, lng]).bindPopup(`
                <strong>${fields.beachName?.stringValue || "Playa Desconocida"}</strong><br>
                <b>Composición:</b> ${fields["Composición"]?.stringValue || "Desconocida"}<br>
                <b>Tipo:</b> ${fields.type?.stringValue || "N/A"}<br>
                <b>Clasificación:</b> ${fields.classification?.stringValue || "N/A"}<br>
                <b>Acceso:</b> ${fields["Condiciones de acceso"]?.stringValue || "N/A"}
            `);

            console.log("📌 Marcador creado:", marker);

            beachMarkers.push(marker);
            marker.addTo(window.map);
            console.log("✅ Marcador agregado al mapa");
        });

        isBeachViewActive = true;
        console.log("✅ Playas mostradas en el mapa correctamente.");
    } catch (error) {
        console.error("❌ Error al cargar los datos de playas:", error);
    }
}

function toggleSatelliteView() {
    if (!window.map) {
        console.error("El mapa aún no está disponible.");
        return;
    }

    if (!isSatelliteView) {
        satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
        }).addTo(window.map);
        window.map.removeLayer(window.defaultLayer);
    } else {
        window.map.addLayer(window.defaultLayer);
        window.map.removeLayer(satelliteLayer);
    }

    isSatelliteView = !isSatelliteView;
}

function toggleStreetView() {
    if (!window.map) {
        console.error("El mapa aún no está disponible.");
        return;
    }

    if (isSatelliteView) {
        window.map.addLayer(window.defaultLayer);
        window.map.removeLayer(satelliteLayer);
        isSatelliteView = false;
    }
}