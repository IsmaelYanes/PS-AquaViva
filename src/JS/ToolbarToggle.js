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
let beachMarkers = [];
let isBeachViewActive = false;

function showLocation() {
    alert("Agregado a favoritos");
}

function addToFavorites() {
    alert("Agregado a favoritos");
}

function measureDistance() {
    alert("Midiendo distancia");
}

function defineZone() {
    if (isBeachViewActive) {
        console.log("🔄 Restaurando zonas litoral y eliminando todos los marcadores...");

        beachMarkers.forEach(marker => window.map.removeLayer(marker));
        beachMarkers = [];

        if (window.zonasLitoralLayer) {
            window.zonasLitoralLayer.addTo(window.map);
        }

        isBeachViewActive = false;
        console.log("✅ Zonas litoral restauradas y marcadores eliminados.");
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

        beaches.forEach((doc, index) => {
            let fields = doc.fields;

            let lat = fields.LAT ? parseFloat(fields.LAT.stringValue.replace(",", ".")) : null;
            let lng = fields.LOG ? parseFloat(fields.LOG.stringValue.replace(",", ".")) : null;

            if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
                console.warn(`⚠️ Coordenadas inválidas para la playa ${fields.beachName?.stringValue || "Desconocida"} (ID: ${doc.name})`);
                return;
            }

            let coords = [lat, -lng];

            console.log(`📍 Intentando agregar marcador en coordenadas: ${coords}`);

            //Popup emergente al clickar en un marcador.
            let marker = L.marker(coords).addTo(window.map);

            marker.on("click", function () {
                showCustomPopup(fields);
            });

            beachMarkers.push(marker);

            console.log("✅ Marcador agregado al mapa");
        });

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
        satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
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
