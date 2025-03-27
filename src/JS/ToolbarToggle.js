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
function showBeaches() {
    alert("Mostrando playas cercanas");
}

function toggleSatelliteView() {
    if (!window.map) {
        console.error("El mapa aún no está disponible.");
        return;
    }

    if (!isSatelliteView) {
        // Activar vista satelital
        satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
        }).addTo(window.map);
        window.map.removeLayer(window.defaultLayer);
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