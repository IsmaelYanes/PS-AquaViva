async function populateNotificationDropdown() {
    const dropdown = document.getElementById("notifications");
    dropdown.innerHTML = "";

    const unreadBeachIds = await getFavoriteBeachesWithUnreadComments();

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

        const notificationItem = document.createElement("div");
        notificationItem.className = "notification-item";
        notificationItem.style.display = "flex";
        notificationItem.style.alignItems = "center";
        notificationItem.style.cursor = "pointer";
        notificationItem.style.gap = "10px";

        const img = document.createElement("img");
        img.src = image;
        img.alt = name;
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";

        const text = document.createElement("span");
        text.textContent = `💬 Nuevos comentarios en ${name}`;

        // 👉 Acción al hacer clic en la notificación: mostrar el popup
        notificationItem.addEventListener("click", async () => {
            await showCustomPopup(fields, false); // false: no mostramos botón de ruta por defecto
        });

        notificationItem.appendChild(img);
        notificationItem.appendChild(text);
        dropdown.appendChild(notificationItem);
    });
}