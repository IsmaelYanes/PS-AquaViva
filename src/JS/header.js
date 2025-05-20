async function getUnreadFavoritesWithUid(uid, favoriteBeaches = null) {
    if (!uid) {
        throw new Error("UID es obligatorio");
    }

    // Si no pasaron la lista de favoritas, la intentamos cargar igual que antes
    if (!favoriteBeaches) {
        const localKey = `favoritos_${uid}`;
        let favoritosString = localStorage.getItem(localKey);
        if (!favoritosString) {
            await downloadFavourite(uid);
            favoritosString = localStorage.getItem(localKey);
            if (!favoritosString) {
                console.warn("⚠️ No se encontraron favoritos tras descargar.");
                return [];
            }
        }
        favoriteBeaches = JSON.parse(favoritosString);
    }

    // Limpiar IDs de espacios u otros caracteres invisibles
    favoriteBeaches = favoriteBeaches.map(id => String(id).trim());

    const pendientes = [];

    for (const beachId of favoriteBeaches) {
        console.log(`Mirando la playa ${beachId}`);
        const hasUnread = await hasUnreadComments(uid, beachId);
        if (hasUnread) pendientes.push(beachId);
    }

    return pendientes;
}

async function populateNotificationDropdown() {

    console.log("Se llamo correctamente.");
    const dropdown = document.getElementById("notifications");
    dropdown.innerHTML = "";

    const uid = localStorage.getItem("uid");
    const unreadBeachIds = await getUnreadFavoritesWithUid(uid);

    if (unreadBeachIds.length === 0) {
        dropdown.innerHTML = `<div class="notification-item">🔕 No hay nuevas notificaciones</div>`;
        return;
    }

    const allBeaches = await fetchAllBeaches();

    unreadBeachIds.forEach(beachId => {
        const beachDoc = allBeaches.find(doc => doc.name.split("/").pop() === beachId);
        if (!beachDoc) return;

        const fields = beachDoc.fields;
        const name = fields?.beachName?.stringValue || "Playa desconocida";
        const image = fields?.imageURL?.stringValue || "/src/Images/default-beach.jpg";

        const lat = fields?.LAT?.stringValue?.replace(",", ".") || "0";
        const lon = fields?.LOG?.stringValue?.replace(",", ".") || "0";

        const notificationLink = document.createElement("a");
        notificationLink.href = `../HTML/moreinfoPageTool.html?id=${beachId}&lat=${lat}&lon=-${lon}`;
        notificationLink.className = "notification-item";
        notificationLink.style.display = "flex";
        notificationLink.style.alignItems = "center";
        notificationLink.style.gap = "10px";
        notificationLink.style.textDecoration = "none";
        notificationLink.style.color = "inherit";

        const img = document.createElement("img");
        img.src = image;
        img.alt = name;
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";

        const text = document.createElement("span");
        text.textContent = `💬 Nuevos comentarios en ${name}`;

        notificationLink.appendChild(img);
        notificationLink.appendChild(text);
        dropdown.appendChild(notificationLink);
    });
}