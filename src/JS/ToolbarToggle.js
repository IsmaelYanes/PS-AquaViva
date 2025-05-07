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

// Variables globales para la ubicación del usuario
window.userLat = null;
window.userLng = null;

// Variable global para almacenar la caché de playas
let cachedBeaches = null;

//Función para pasar de página ya que con cada llamada solo te puedes traer una pila de 100 playas.
async function fetchAllBeaches() {
    // Si ya hay datos en caché, los devolvemos directamente
    if (cachedBeaches !== null) {
        console.log("⚡ Usando playas desde caché.");
        return cachedBeaches;
    }

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

        // Guardamos los datos en la caché
        cachedBeaches = allBeaches;
        return allBeaches;
    } catch (error) {
        console.error("❌ Error al descargar playas:", error);
        return [];
    }
}

//Funcion de abrir popup de marcador de playa.
function showCustomPopup(fields, showRouteButton = false, routeData = null) {
    // Eliminar popup existente
    const existing = document.getElementById("custom-popup");
    if (existing) existing.remove();

    // Botón de iniciar ruta
    const routeButtonHTML = showRouteButton
        ? `<button class="route-btn" onclick="startRoute()">Iniciar ruta</button>`
        : "";

    // Construir info de ruta si routeData trae datos
    let routeInfoHTML = "";
    if (routeData) {
        // 1) Intentar extraer summary del GeoJSON
        let summary = routeData.features?.[0]?.properties?.summary;
        // 2) Si no existe ahí, probar en el JSON “routes”
        if (!summary) {
            summary = routeData.routes?.[0]?.summary;
        }
        if (summary) {
            const km  = (summary.distance / 1000).toFixed(2);

            // Calcular la duración en horas y minutos (hh:mm)
            const durationInSec = summary.duration;
            const hours = Math.floor(durationInSec / 3600); // Obtener horas
            const minutes = Math.floor((durationInSec % 3600) / 60); // Obtener minutos
            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            routeInfoHTML = `
                <p><strong>Distancia:</strong> ${km} km <strong>Duración:</strong> ${formattedTime}</p>
            `;
        }
    }

    // Construcción del popup
    const html = `
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
          ${routeInfoHTML}
        </div>
        <div class="popup-footer">
          <a href="../HTML/moreinfoPageTool.html?id=${fields["ID DGE"]?.integerValue}
                 &lat=${fields.LAT.stringValue.replace(",", ".")}
                 &lon=-${fields.LOG.stringValue.replace(",", ".")}"
             class="more-info">Ver más</a>
          ${routeButtonHTML}
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML("beforeend", html);
}

function startRoute() {
    if (window.userLat === null || window.userLng === null) {
        alert("⚠️ No se ha obtenido tu ubicación aún.");
        return;
    }

    if (!window.selectedBeachMarker) {
        alert("⚠️ No hay destino seleccionado.");
        return;
    }

    const destLat = window.selectedBeachMarker.getLatLng().lat;
    const destLng = window.selectedBeachMarker.getLatLng().lng;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${window.userLat},${window.userLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, "_blank");
}

//Funcion para detectar en que isla se encuentra el usuario.
function getIslandFromCoords(lat, lng) {
    const islands = [
        { name: "Tenerife", center: [28.2916, -16.6291], radius: 0.7 },
        { name: "Gran Canaria", center: [28.1248, -15.43], radius: 0.6 },
        { name: "Lanzarote", center: [29.0469, -13.5899], radius: 0.5 },
        { name: "Fuerteventura", center: [28.3587, -14.0537], radius: 0.6 },
        { name: "La Palma", center: [28.68, -17.76], radius: 0.3 },
        { name: "La Gomera", center: [28.1, -17.2], radius: 0.2 },
        { name: "El Hierro", center: [27.74, -18.02], radius: 0.2 },
        { name: "La Graciosa", center: [29.2421, -13.5051], radius: 0.1 },
        { name: "Lobos", center: [28.7431, -13.7991], radius: 0.05 }
    ];

    for (let island of islands) {
        let d = Math.sqrt(Math.pow(lat - island.center[0], 2) + Math.pow(lng - island.center[1], 2));
        if (d <= island.radius) return island.name;
    }

    return null;
}

//Cargar las playas de una isla.
async function loadIslandBeaches(userLat, userLng, currentIsland) {
    const allBeaches = await fetchAllBeaches();
    const islandBeaches = allBeaches.filter(beach =>
        beach.fields?.island?.stringValue === currentIsland
    );

    if (islandBeaches.length === 0) {
        alert("❌ No se encontraron playas en esta isla.");
        return;
    }

    // Crear el cluster de marcadores
    window.markersCluster = L.markerClusterGroup();

    islandBeaches.forEach((doc) => {
        const fields = doc.fields;
        const lat = parseFloat(fields.LAT.stringValue.replace(",", "."));
        const lng = -parseFloat(fields.LOG.stringValue.replace(",", "."));
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng]);
        marker.beachData = fields;

        marker.on("click", async function () {
            // Si ya hay un marcador seleccionado, eliminarlo
            if (window.selectedBeachMarker) {
                window.map.removeLayer(window.selectedBeachMarker);
                window.selectedBeachMarker = null;
            }

            const apiKey = "5b3ce3597851110001cf62489491c8fc7ce04b4d9cd3809505e013ab";
            const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson?api_key=${apiKey}`;

            const body = {
                coordinates: [
                    [userLng, userLat],
                    [lng, lat]
                ]
            };

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                const data = await response.json();
                if (!data?.features?.[0]?.geometry?.coordinates) {
                    throw new Error("La respuesta no contiene GeoJSON válido.");
                }

                // Decodificar coords y crear polyline
                const coords = data.features[0].geometry.coordinates;
                const latlngs = coords.map(c => [c[1], c[0]]);

                // Marcar la playa seleccionada
                window.selectedBeachMarker = L.marker([lat, lng]).addTo(window.map);
                window.selectedBeachMarker.on("click", () => {
                    showCustomPopup(fields, true, data);
                });

                // Dibujar la ruta
                window.routeLayer = L.polyline(latlngs, {
                    color: "blue",
                    weight: 5,
                    opacity: 0.7,
                    smoothFactor: 1
                }).addTo(window.map);
                window.routeLayer.on("click", () => {
                    showCustomPopup(fields, true, data);
                });

                // Ajustar vista
                window.map.fitBounds(window.routeLayer.getBounds(), {
                    padding: [50, 50]
                });

                // Mostrar popup con datos de ruta PASÁNDOLE `data`
                showCustomPopup(fields, true, data);

                // Eliminar el cluster ahora que ya hay ruta
                window.map.removeLayer(window.markersCluster);

                // ⬅️ Botón de volver
                const BackButton = L.Control.extend({
                    options: { position: "topleft" },
                    onAdd: function () {
                        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
                        Object.assign(container.style, {
                            backgroundColor: "white",
                            border: "2px solid #666",
                            cursor: "pointer",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "20px"
                        });
                        container.innerHTML = "←";

                        container.onclick = async () => {
                            // Limpiar ruta y marcador
                            if (window.routeLayer) {
                                window.map.removeLayer(window.routeLayer);
                                window.routeLayer = null;
                            }
                            if (window.selectedBeachMarker) {
                                window.map.removeLayer(window.selectedBeachMarker);
                                window.selectedBeachMarker = null;
                            }
                            if (window.backButtonControl) {
                                window.map.removeControl(window.backButtonControl);
                                window.backButtonControl = null;
                            }

                            // Reaparecer cluster
                            window.map.addLayer(window.markersCluster);
                            await loadIslandBeaches(userLat, userLng, currentIsland);
                        };

                        return container;
                    }
                });

                window.backButtonControl = new BackButton();
                window.map.addControl(window.backButtonControl);

            } catch (error) {
                console.error("❌ Error al obtener la ruta:", error);

                // Mostrar sólo el popup estándar (sin datos de ruta)
                showCustomPopup(fields);

                // Crear el contenedor del mensaje
                const message = document.createElement("div");

                // Establecer el contenido y el estilo
                message.textContent = "Esta ubicación no es posible el acceso";
                message.style.backgroundColor = "#f44336";
                message.style.color = "white";
                message.style.padding = "10px";
                message.style.borderRadius = "5px";
                message.style.position = "fixed";
                message.style.top = "20px";
                message.style.left = "50%";
                message.style.transform = "translateX(-50%)";
                message.style.zIndex = "1000";
                message.style.display = "none";  // Inicialmente oculto

                // Añadir el mensaje al body
                document.body.appendChild(message);

                // Mostrar el mensaje
                message.style.display = "block";

                // Ocultar el mensaje después de 2 segundos
                setTimeout(function () {
                    message.style.display = "none";
                }, 2000);

                // Mantener el cluster visible
                window.map.addLayer(window.markersCluster);
            }
        });

        window.markersCluster.addLayer(marker);
    });

    // Añadir el cluster al mapa
    window.map.addLayer(window.markersCluster);
}

// Función para obtener la ubicación del usuario y actualizar el marcador
function getUserLocation(callback) {
    if (!navigator.geolocation) {
        alert("⚠️ La geolocalización no está soportada en tu navegador.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            window.userLat = position.coords.latitude;
            window.userLng = position.coords.longitude;

            if (window.userLocationMarker) {
                window.map.removeLayer(window.userLocationMarker);
                window.userLocationMarker = null;
            }

            window.userLocationMarker = L.marker([userLat, userLng], {
                icon: L.icon({
                    iconUrl: "https://cdn3.iconfinder.com/data/icons/map-navigation-8/512/location-pin-coordinate-point-128.png",
                    iconSize: [35, 35],
                    iconAnchor: [17, 34],
                    popupAnchor: [0, -34]
                })
            }).addTo(window.map).bindPopup("📍 Estás aquí").openPopup();

            callback(userLat, userLng);
        },
        function (error) {
            console.error("❌ Error obteniendo la ubicación:", error);

            if (error.code === 1) {
                alert("📵 Has denegado el acceso a tu ubicación. No se podrá mostrar tu posición actual.");
            } else if (error.code === 2) {
                alert("⚠️ La ubicación no está disponible.");
            } else if (error.code === 3) {
                alert("⏱ La solicitud de ubicación ha tardado demasiado.");
            } else {
                alert("⚠️ No se pudo obtener tu ubicación.");
            }
        }
    );
}

let satelliteLayer;
let isSatelliteView = false;
let isBeachViewActive = false;

//Funcion para mostrar las playas filtradas (Se le pasa las playas)
function showFilteredBeaches(filteredBeaches) {
    if (!window.map) {
        console.error("❌ El mapa aún no está disponible.");
        return;
    }

    try {
        // Ocultamos capa de zonas litoral si está activa
        if (window.zonasLitoralLayer) {
            window.map.removeLayer(window.zonasLitoralLayer);
        }

        // Limpiamos clústeres anteriores
        if (window.markersCluster) {
            window.map.removeLayer(window.markersCluster);
        }
        window.markersCluster = L.markerClusterGroup();

        let boundsCoords = [];

        filteredBeaches.forEach((doc) => {
            let fields = doc.fields;

            let lat = fields.LAT ? parseFloat(fields.LAT.stringValue.replace(",", ".")) : null;
            let lng = fields.LOG ? parseFloat(fields.LOG.stringValue.replace(",", ".")) : null;

            if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
                console.warn(`⚠️ Coordenadas inválidas para la playa ${fields.beachName?.stringValue || "Desconocida"}`);
                return;
            }

            let coords = [lat, -lng]; // Negativo para corregir longitudes del oeste

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

            window.markersCluster.addLayer(marker);
            boundsCoords.push(coords);
        });

        // Agregar clúster al mapa
        window.map.addLayer(window.markersCluster);

        // Centrar el mapa automáticamente si hay coordenadas válidas
        if (boundsCoords.length > 0) {
            let bounds = L.latLngBounds(boundsCoords);
            window.map.fitBounds(bounds, { padding: [50, 50] });
        }

        window.map.invalidateSize();
        isBeachViewActive = true;
        console.log(`✅ Mostradas ${filteredBeaches.length} playas filtradas.`);
    } catch (error) {
        console.error("❌ Error al mostrar playas filtradas:", error);
    }
}

function showLocation() {
    getUserLocation(function (userLat, userLng) {
        console.log(`📍 Ubicación actual: ${userLat}, ${userLng}`);

        window.map.setView([userLat, userLng], 12);
    });
}

function addToFavorites() {
    alert("Agregado a favoritos");
}

async function measureDistance() {
    getUserLocation(async function (userLat, userLng) {
        // 🧼 LIMPIEZA DEL MAPA
        if (window.zonasLitoralLayer) window.map.removeLayer(window.zonasLitoralLayer);
        if (window.markersCluster) window.map.removeLayer(window.markersCluster);
        if (window.routeLayer) {
            window.map.removeLayer(window.routeLayer);
            window.routeLayer = null;
        }
        if (window.selectedBeachMarker) {
            window.map.removeLayer(window.selectedBeachMarker);
            window.selectedBeachMarker = null;
        }
        if (window.backButtonControl) {
            window.map.removeControl(window.backButtonControl);
            window.backButtonControl = null;
        }

        // 📍 Mostrar nueva ubicación del usuario
        const currentIsland = getIslandFromCoords(userLat, userLng);
        if (!currentIsland) {
            alert("⚠️ No se pudo determinar en qué isla te encuentras.");
            return;
        }

        const islandInfo = [
            { name: "Tenerife", center: [28.2916, -16.6291], zoom: 9 },
            { name: "Gran Canaria", center: [28.1248, -15.43], zoom: 9 },
            { name: "Lanzarote", center: [29.0469, -13.5899], zoom: 10 },
            { name: "Fuerteventura", center: [28.3587, -14.0537], zoom: 9 },
            { name: "La Palma", center: [28.68, -17.76], zoom: 10 },
            { name: "La Gomera", center: [28.1, -17.2], zoom: 11 },
            { name: "El Hierro", center: [27.74, -18.02], zoom: 11 },
            { name: "La Graciosa", center: [29.2421, -13.5051], zoom: 12 },
            { name: "Lobos", center: [28.7431, -13.7991], zoom: 13 }
        ].find(i => i.name === currentIsland);

        if (islandInfo) {
            window.map.setView(islandInfo.center, islandInfo.zoom);
        }

        await loadIslandBeaches(userLat, userLng, currentIsland);
    });
}

function defineZone() {
    console.log("🔄 Restaurando zonas litoral y limpiando elementos del mapa...");

    // Eliminar clústeres si existen
    if (window.markersCluster) {
        window.map.removeLayer(window.markersCluster);
        window.markersCluster = null;
    }

    // Eliminar ruta si existe
    if (window.routeLayer) {
        window.map.removeLayer(window.routeLayer);
        window.routeLayer = null;
    }

    // Eliminar marcador de ubicación del usuario
    if (window.userLocationMarker) {
        window.map.removeLayer(window.userLocationMarker);
        window.userLocationMarker = null;
    }

    // Eliminar marcador de playa seleccionada
    if (window.selectedBeachMarker) {
        window.map.removeLayer(window.selectedBeachMarker);
        window.selectedBeachMarker = null;
    }

    // Eliminar botón de volver si existe
    if (window.backButtonControl) {
        window.map.removeControl(window.backButtonControl);
        window.backButtonControl = null;
    }

    // Restaurar o cargar la capa de zonas litoral
    if (window.zonasLitoralLayer) {
        window.zonasLitoralLayer.addTo(window.map);
        console.log("✅ Capa de zonas litoral restaurada.");
    } else {
        // Si no existe, la cargamos desde el archivo JSON
        fetch('../Data/zonas_litoral.json')
            .then(response => response.json())
            .then(geojsonData => {
                window.zonasLitoralLayer = L.geoJSON(geojsonData, {
                    style: feature => ({
                        color: feature.properties.color || "blue",
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.4
                    }),
                    onEachFeature: (feature, layer) => {
                        if (feature.properties) {
                            layer.on('click', (e) => {
                                abrirPopup(feature.properties, e);
                            });
                        }
                    }
                }).addTo(window.map);
                console.log("✅ Capa de zonas litoral cargada por primera vez.");
            })
            .catch(error => {
                console.error("❌ Error al cargar zonas_litoral.json:", error);
                alert("No se pudo cargar la capa de zonas litoral.");
            });
    }

    isBeachViewActive = false;
}

async function showBeaches() {
    if (!window.map) {
        console.error("❌ El mapa aún no está disponible.");
        return;
    }

    try {
        // 🧼 LIMPIEZA GENERAL DEL MAPA
        if (window.zonasLitoralLayer) {
            window.map.removeLayer(window.zonasLitoralLayer);
            window.zonasLitoralLayer = null;
        }
        if (window.markersCluster) {
            window.map.removeLayer(window.markersCluster);
            window.markersCluster = null;
        }
        if (window.routeLayer) {
            window.map.removeLayer(window.routeLayer);
            window.routeLayer = null;
        }
        if (window.userLocationMarker) {
            window.map.removeLayer(window.userLocationMarker);
            window.userLocationMarker = null;
        }
        if (window.selectedBeachMarker) {
            window.map.removeLayer(window.selectedBeachMarker);
            window.selectedBeachMarker = null;
        }
        if (window.backButtonControl) {
            window.map.removeControl(window.backButtonControl);
            window.backButtonControl = null;
        }

        // 🔄 CARGAR PLAYAS
        let beaches = await fetchAllBeaches();
        console.log(`✅ Se han obtenido ${beaches.length} playas en total.`);

        window.markersCluster = L.markerClusterGroup(); // Inicializar nuevo clúster global

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

            window.markersCluster.addLayer(marker); // Agregar al clúster
        });

        window.markersCluster.on("clusterclick", function (event) {
            window.map.setView(event.latlng, window.map.getZoom() + 2);
        });

        window.map.addLayer(window.markersCluster); // Mostrar en mapa

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
