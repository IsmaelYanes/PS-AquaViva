document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const fishName = params.get("name");
    if (!fishName) return console.error("No se proporcionó el nombre del pez en la URL");

    const file = fishName === "Raya toro" ? "../Data/fullfish.json" : "../Data/fish.json";
    fetch(file)
        .then(res => res.json())
        .then(data => {
            const fish = data.find(f => f.name === fishName);
            if (!fish) throw new Error("Pez no encontrado");

            const fields = {
                "fish-title": fish.name,
                "scientific-name": fish.sciname,
                "fish-image": fish.image,
                "description": fish.description,
                "iucn": fish.IUCN,
                "gender-description": fish.genderDescription,
                "type": fish.type,
                "average-size": fish.size,
                "max-size": fish.maxSize,
                "mimetism": fish.mimetism,
                "recognize": fish.recognize,
                "male-female-differences": fish.feMaleDifferences,
                "diet": fish.diet,
                "territorial": fish.territorial,
                "life-mode": fish.lifeMode,
                "life-description": fish.lifeDescription,
                "reproduction-mode": fish.reproductionMode,
                "migration": fish.migration,
                "reproduction-description": fish.reproductionDescription,
                "poison": fish.poison === "No" ? "No" : "Sí",
                "danger": fish.danger,
                "depth-range": fish.depth,
                "map-image": fish.mapImage || ""
            };

            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el.tagName === "IMG") el.src = value || "";
                else el.textContent = value || "No disponible";
                if (id === "fish-image") el.alt = fish.name;
            });
        })
        .catch(err => console.error("Error al cargar la información del pez:", err));
});