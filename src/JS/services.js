function initBeach() {
    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");
    if (beachId) {
        console.log("📌 ID de la playa obtenida:", beachId);
        cargarDatosPlayaDesdeColeccion(beachId);
    }
}

async function cargarDatosPlayaDesdeColeccion(id) {
    try {
        const playas = await fetchAllBeaches(); // Retorna un array de objetos con campos 'fields'

        // Convertimos el ID a número para comparar correctamente con integerValue
        const idBuscado = parseInt(id, 10);

        const playa = playas.find(p =>
            parseInt(p.fields?.["ID DGE"]?.integerValue, 10) === idBuscado
        );

        if (!playa) {
            console.error("⛔ No se encontró la playa con ID DGE:", idBuscado);
            return;
        }

        mostrarDetallesPlaya(playa.fields);
    } catch (error) {
        console.error("❌ Error al cargar playas:", error);
    }
}

function mostrarDetallesPlaya(fields) {

    document.getElementById("beachName").textContent = fields.beachName?.stringValue || "Playa Desconocida";
    document.getElementById("composition").textContent = fields["Composición"]?.stringValue || "No especificado";
    document.getElementById("classification").textContent = fields.classification?.stringValue || "N/A";
    document.getElementById("access").textContent = fields["Condiciones de acceso"]?.stringValue || "No disponible";
    document.getElementById("bathConditions").textContent = fields["Condiciones de baño"]?.stringValue || "No disponible";
    document.getElementById("province").textContent = fields.province?.stringValue || "No disponible";
    document.getElementById("town").textContent = fields.town?.stringValue || "No disponible";
    document.getElementById("loungeRental").textContent = fields["Alquiler de hamacas"]?.stringValue || "No disponible";
    document.getElementById("umbrellaRental").textContent = fields["Alquiler de sombrillas"]?.stringValue || "No disponible";
    document.getElementById("nauticalRental").textContent = fields["Alquiler nautico"]?.stringValue || "No disponible";
    document.getElementById("parking").textContent = fields.Aparcamientos?.stringValue || "No disponible";
    document.getElementById("sportsArea").textContent = fields["Area Deportiva"]?.stringValue || "No disponible";
    document.getElementById("childrenArea").textContent = fields["Area Infantil"]?.stringValue || "No disponible";
    document.getElementById("toilets").textContent = fields.Aseo?.stringValue || "No disponible";
    document.getElementById("footWash").textContent = fields.Lavapies?.stringValue || "No disponible";

    document.getElementById("beachImage").src = fields.imageURL?.stringValue || "https://via.placeholder.com/300";
}
