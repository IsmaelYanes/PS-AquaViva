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

//Función para pasar de página ya que con cada llamada solo te puedes traer una pila de 100 playas.
async function fetchAllBeaches() {
    let url = "https://firestore.googleapis.com/v1/projects/playascanarias-f83a8/databases/(default)/documents/playas";
    let allBeaches = [];
    let nextPageToken = null;

    try {
        do {
            let fullUrl = nextPageToken ? `${url}?pageToken=${nextPageToken}` : url;
            const response = await fetch(fullUrl);
            const data = await response.json();

            if (!data.documents) {
                console.error("❌ No se encontraron datos de playas en Firebase.");
                break;
            }

            allBeaches.push(...data.documents);
            nextPageToken = data.nextPageToken || null;

            console.log(`📥 Descargadas ${data.documents.length} playas, total acumulado: ${allBeaches.length}`);

        } while (nextPageToken);

        return allBeaches;
    } catch (error) {
        console.error("❌ Error al descargar playas:", error);
        return [];
    }
}

//Funcion de abrir popup de marcador de playa.
function showCustomPopup(fields) {
    let existingPopup = document.getElementById("custom-popup");
    if (existingPopup) {
        existingPopup.remove();
    }

    let popupHTML = `
    <div id="custom-popup" class="popup">
        <div class="popup-content">
            <button class="close-btn" onclick="document.getElementById('custom-popup').remove()">X</button>
            <div class="popup-header">
                <h2>${fields.beachName?.stringValue || "Playa Desconocida"}</h2>
            </div>
            <div class="popup-body">
                <img src="${fields.imageURL?.stringValue || 'https://via.placeholder.com/300'}" 
                     alt="Imagen de la playa" class="popup-image">
                <p><strong>Composición:</strong> ${fields["Composición"]?.stringValue || "Desconocida"}</p>
                <p><strong>Tipo:</strong> ${fields.type?.stringValue || "N/A"}</p>
                <p><strong>Clasificación:</strong> ${fields.classification?.stringValue || "N/A"}</p>
                <p><strong>Acceso:</strong> ${fields["Condiciones de acceso"]?.stringValue || "N/A"}</p>
            </div>
            <div class="popup-footer">
                <a href="../HTML/MoreInfoPage.html?id=${fields["ID DGE"]?.integerValue}&lat=${fields.LAT.stringValue.replace(",", ".")}&lon=-${fields.LOG.stringValue.replace(",", ".")}" class="more-info">Ver más</a>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML("beforeend", popupHTML);
}

let satelliteLayer;
let isSatelliteView = false;
let isBeachViewActive = false;

function showLocation() {
    if (window.userLocationMarker) {
        window.map.removeLayer(window.userLocationMarker);
        window.userLocationMarker = null; // Resetear la variable
        console.log("📍 Marcador de ubicación eliminado.");
        return;
    }

    if (!navigator.geolocation) {
        alert("⚠️ La geolocalización no está soportada en tu navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            let userLat = position.coords.latitude;
            let userLng = position.coords.longitude;

            console.log(`📍 Ubicación actual: ${userLat}, ${userLng}`);

            window.userLocationMarker = L.marker([userLat, userLng], {
                icon: L.icon({
                    iconUrl: "https://cdn3.iconfinder.com/data/icons/map-navigation-8/512/location-pin-coordinate-point-128.png",
                    iconSize: [35, 35],
                    iconAnchor: [17, 34],
                    popupAnchor: [0, -34]
                })
            }).addTo(window.map)
                .bindPopup("📍 Estás aquí").openPopup();

            window.map.setView([userLat, userLng], 12);
        },
        function (error) {
            console.error("❌ Error obteniendo la ubicación:", error);
            alert("⚠️ No se pudo obtener tu ubicación.");
        }
    );
}

function addToFavorites() {
    alert("Agregado a favoritos");
}

function measureDistance() {
    alert("Midiendo distancia");
}

function defineZone() {
    if (isBeachViewActive) {
        console.log("🔄 Restaurando zonas litoral y eliminando todos los marcadores y clústeres...");

        // Eliminar el grupo de clústeres si existe
        if (window.markersCluster) {
            window.map.removeLayer(window.markersCluster);
            window.markersCluster = null;
        }

        // Restaurar la capa de zonas litoral si existe
        if (window.zonasLitoralLayer) {
            window.zonasLitoralLayer.addTo(window.map);
        }

        isBeachViewActive = false;
        console.log("✅ Zonas litoral restauradas y todos los marcadores eliminados.");
    }
}

async function showBeaches() {
    if (!window.map) {
        console.error("❌ El mapa aún no está disponible.");
        return;
    }

    try {
        let beaches = await fetchAllBeaches();
        console.log(`✅ Se han obtenido ${beaches.length} playas en total.`);

        if (window.zonasLitoralLayer) {
            window.map.removeLayer(window.zonasLitoralLayer);
        }

        // Eliminar clústeres y marcadores anteriores si existen
        if (window.markersCluster) {
            window.map.removeLayer(window.markersCluster);
        }
        window.markersCluster = L.markerClusterGroup(); // Guardar en variable global

        beaches.forEach((doc) => {
            let fields = doc.fields;

            let lat = fields.LAT ? parseFloat(fields.LAT.stringValue.replace(",", ".")) : null;
            let lng = fields.LOG ? parseFloat(fields.LOG.stringValue.replace(",", ".")) : null;

            if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
                console.warn(`⚠️ Coordenadas inválidas para la playa ${fields.beachName?.stringValue || "Desconocida"} (ID: ${doc.name})`);
                return;
            }

            let coords = [lat, -lng];

            console.log(`📍 Intentando agregar marcador en coordenadas: ${coords}`);

            let marker = L.marker(coords);
            marker.beachData = fields;

            marker.on("click", function (event) {
                let currentZoom = window.map.getZoom();
                if (currentZoom >= 14 || !marker._icon.classList.contains("leaflet-cluster-icon")) {
                    showCustomPopup(fields);
                } else {
                    window.map.setView(event.latlng, currentZoom + 2);
                }
            });

            window.markersCluster.addLayer(marker); // Agregar al grupo global
        });

        window.markersCluster.on("clusterclick", function (event) {
            window.map.setView(event.latlng, window.map.getZoom() + 2);
        });

        window.map.addLayer(window.markersCluster); // Agregar al mapa

        window.map.invalidateSize();
        isBeachViewActive = true;
        console.log("✅ Playas mostradas en el mapa correctamente.");
    } catch (error) {
        console.error("❌ Error al mostrar las playas:", error);
    }
}

function toggleSatelliteView() {
    if (!window.map) {
        console.error("El mapa aún no está disponible.");
        return;
    }

    if (!isSatelliteView) {
        satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com">Esri</a> contributors'
        }).addTo(window.map);
        window.map.removeLayer(window.defaultLayer);
    }

    isSatelliteView = true;
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
