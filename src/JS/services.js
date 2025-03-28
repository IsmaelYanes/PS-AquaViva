const urlParams = new URLSearchParams(window.location.search);
const beachId = urlParams.get("id");

if (!beachId) {
    console.error("⛔ No se proporcionó un ID de playa en la URL");
} else {
    console.log(`📌 ID de la playa recibida: ${beachId}`);
    cargarDatosPlaya(beachId);
}

async function cargarDatosPlaya(id) {
    let url = `https://firestore.googleapis.com/v1/projects/playascanarias-f83a8/databases/(default)/documents/playas/${id}`;

    try {
        const response = await fetch(url);
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
    document.getElementById("location").textContent = `${fields.LAT?.doubleValue || "N/A"}, ${fields.LOG?.doubleValue || "N/A"}`;
    document.getElementById("composition").textContent = fields["Composición"]?.stringValue || "No especificado";
    document.getElementById("type").textContent = fields.type?.stringValue || "N/A";
    document.getElementById("classification").textContent = fields.classification?.stringValue || "N/A";
    document.getElementById("access").textContent = fields["Condiciones de acceso"]?.stringValue || "No disponible";

    document.getElementById("beachImage").src = fields.imageURL?.stringValue || "https://via.placeholder.com/300";
}
