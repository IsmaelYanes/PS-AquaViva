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
                "iucn": fish.species_ecology?.description,
                "gender-description": fish.genderDescription,
                "type": fish.familia?.name,
                "average-size": fish.species_morphology?.size_average ? `${fish.species_morphology.size_average} cm` : null,
                "max-size": fish.species_morphology?.size_max ? `${fish.species_morphology.size_max} cm` : null,
                "mimetism": fish.mimetism,
                "recognize": fish.recognize,
                "male-female-differences": fish.feMaleDifferences,
                "diet": fish.species_behavior?.regime?.translated_name,
                "territorial": fish.territorial,
                "life-mode": fish.species_behavior?.sociability?.label,
                "life-description": fish.lifeDescription,
                "reproduction-mode": fish.reproductionMode,
                "migration": fish.migration,
                "reproduction-description": fish.reproductionDescription,
                "poison": fish.poison === "No" ? "No" : (fish.poison ? "Sí" : null),
                "danger": fish.danger,
                "depth-range": fish.depth,
                "map-image": fish.mapImage
            };

            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (!el) return;

                if (el.tagName === "IMG") {
                    const isMap = id === "map-image";
                    const defaultImg = isMap ? "../images/no-map.jpg" : "../images/no-image.jpg";
                    el.src = value && value.trim() !== "" ? value : defaultImg;
                    el.alt = fish.nom_commun || fish.name || "Imagen no disponible";
                } else {
                    el.textContent = value || "No disponible";
                }
            });
        })
        .catch(err => console.error("Error al cargar la información del pez:", err));
});
