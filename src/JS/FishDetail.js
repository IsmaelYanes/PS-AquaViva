document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const fishName = params.get("name");
    if (!fishName) return console.error("No se proporcionó el nombre del pez en la URL");

    const file = "../Data/fullfish.json";
    fetch(file)
        .then(res => res.json())
        .then(data => {
            const fish = data.find(f => f.nom_commun?.toLowerCase() === fishName.toLowerCase());
            if (!fish) throw new Error("Pez no encontrado");

            const fields = {
                "fish-title": fish.nom_commun || fish.name,
                "scientific-name": fish.name,
                "fish-image": fish.image,
                "description": fish.description_summary,
                "family": fish.familia?.name,
                "average-size": fish.species_morphology?.size_average ? `${fish.species_morphology.size_average} cm` : null,
                "max-size": fish.species_morphology?.size_max ? `${fish.species_morphology.size_max} cm` : null,
                // Estado IUCN ahora usa el campo description de species_ecology
                "iucn": fish.species_ecology?.description || "No evaluado",  // Si description no existe, muestra "No evaluado"
                "sociability": fish.species_behavior?.sociability?.label,
                "diet": fish.species_behavior?.regime?.translated_name,
                // Veneno (is_poissons es booleano)
                "venom": typeof fish.species_data?.is_poissons === "boolean"
                    ? (fish.species_data.is_poissons ? "Sí" : "No")
                    : "No disponible", // Si no está definido
                "map-image": fish.mapImage
            };

            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id);
                const container = el?.closest(".info-group") || el; // Para ocultar secciones enteras si es posible
                if (!el) return;

                if (!value || value.trim?.() === "") {
                    if (container) container.style.display = "none";
                    return;
                }

                if (el.tagName === "IMG") {
                    const isMap = id === "map-image";
                    const defaultImg = isMap ? "../images/no-map.jpg" : "../images/no-image.jpg";
                    el.src = value;
                    el.alt = fields["fish-title"] || "Imagen no disponible";
                } else {
                    el.textContent = value;
                }

                if (container) container.style.display = "";
            });
        })
        .catch(err => console.error("Error al cargar la información del pez:", err));
});
