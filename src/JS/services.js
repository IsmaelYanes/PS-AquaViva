document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");
    if (beachId) {
        console.log("📌 ID de la playa obtenida:", beachId);
        cargarDatosPlaya(beachId);
    }
});

async function cargarDatosPlaya(id) {
    const url = `https://firestore.googleapis.com/v1/projects/playascanarias-f83a8/databases/(default)/documents/playas/${id}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.fields) {
            console.error("⛔ No se encontraron datos de la playa.");
            return;
        }

        mostrarDetallesPlaya(data.fields);
    } catch (error) {
        console.error("❌ Error al obtener datos de la playa:", error);
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

    window.coordLAT = fields.LAT?.stringValue.replace(",", ".") || '';
    window.coordLON = fields.LON?.stringValue.replace(",", ".") || '';
}
