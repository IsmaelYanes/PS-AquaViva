let allFish = [];
let selectedFish = [];

function initBeach() {
    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");

    lat = urlParams.get("lat");
    lon = urlParams.get("lon");
    console.log(lat, lon);
    const jsonURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
    console.log("📡 URL del tiempo:", jsonURL);

    // --- NUEVO: Carga los peces para autocomplete ---
    loadFishData();

    if (beachId) {
        console.log("📌 ID de la playa obtenida:", beachId);
        cargarDatosPlayaDesdeColeccion(beachId);
        mostrarRecomendaciones(jsonURL);
    }

    // --- NUEVO: Inicializa el buscador de peces ---
    initFishAutocomplete();

    //Ver comentarios
    showCommentsWithFishImages();

}

async function loadFishData() {
    try {
        const response = await fetch("../Data/fullfish.json");
        const data = await response.json();
        allFish = data.map(f => ({
            name: f["nom_commun"],
            image: f.image
        }));
    } catch (e) {
        console.error("Error cargando datos de peces:", e);
    }
}

function filterFish(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    return allFish.filter(fish =>
        fish.name.toLowerCase().includes(q) &&
        !selectedFish.find(sf => sf.name === fish.name)
    );
}

function renderFishSuggestions(filtered) {
    const suggestions = document.getElementById("fishSuggestions");
    suggestions.innerHTML = "";

    if (filtered.length === 0) {
        suggestions.style.display = "none";
        return;
    }

    for (const fish of filtered) {
        const li = document.createElement("li");
        li.innerHTML = `<img src="${fish.image}" alt="${fish.name}"> <span>${fish.name}</span>`;
        li.addEventListener("click", () => {
            addFishChip(fish);
            clearFishSuggestions();
            document.getElementById("fishInput").value = "";
        });
        suggestions.appendChild(li);
    }

    suggestions.style.display = "block";
}

function addFishChip(fish) {
    selectedFish.push(fish);
    renderSelectedFish();
}

function renderSelectedFish() {
    const container = document.getElementById("fishSelectedList");
    container.innerHTML = "";

    selectedFish.forEach((fish, index) => {
        const chip = document.createElement("div");
        chip.className = "fish-chip";
        chip.innerHTML = `
          <img src="${fish.image}" alt="${fish.name}">
          <span>${fish.name}</span>
          <span class="remove-chip" title="Eliminar">&times;</span>
        `;
        chip.querySelector(".remove-chip").addEventListener("click", () => {
            selectedFish.splice(index, 1);
            renderSelectedFish();
        });
        container.appendChild(chip);
    });
}

function clearFishSuggestions() {
    const suggestions = document.getElementById("fishSuggestions");
    suggestions.innerHTML = "";
    suggestions.style.display = "none";
}

function initFishAutocomplete() {
    const input = document.getElementById("fishInput");
    input.addEventListener("input", (e) => {
        const filtered = filterFish(e.target.value);
        renderFishSuggestions(filtered);
    });

    document.addEventListener("click", (e) => {
        if (!document.querySelector(".fish-autocomplete-container").contains(e.target)) {
            clearFishSuggestions();
        }
    });
}

//añadir comentario
async function handleAddComment(e) {
    if (e) e.preventDefault();

    const button = document.getElementById("submitComment");
    button.disabled = true;

    try {
        const isUserLogged = comprobarUsuario();
        if (!isUserLogged) {
            alert("Debes iniciar sesión para poder comentar.");
            button.disabled = false;
            return;
        }

        const commentInput = document.getElementById("commentInput");
        const commentText = commentInput.value.trim();

        if (!commentText) {
            alert("El comentario no puede estar vacío.");
            button.disabled = false;
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const beachId = urlParams.get("id");

        if (!beachId) {
            alert("No se pudo determinar la playa para añadir el comentario.");
            button.disabled = false;
            return;
        }

        const userEmail = localStorage.getItem("email");
        const userUid = localStorage.getItem("uid");

        const commentData = {
            text: commentText,
            date: new Date(),
            owner: userEmail,
            uid: userUid,
            fish: selectedFish.map(f => f.name)
        };

        await addComment(beachId, commentData);

        alert("Comentario añadido correctamente.");
        showCommentsWithFishImages();

        commentInput.value = "";
        selectedFish = [];
        renderSelectedFish();

    } catch (error) {
        console.error("Error añadiendo comentario:", error);
        alert("Hubo un error al añadir el comentario.");
    } finally {
        button.disabled = false; // Reactiva el botón pase lo que pase
    }
}

//mostrar comentarios:
async function showCommentsWithFishImages() {
    const urlParams = new URLSearchParams(window.location.search);
    const beachId = urlParams.get("id");
    const currentUserUid = localStorage.getItem("uid");
    const currentUserEmail = localStorage.getItem("email"); // asumimos que guardas el email en localStorage

    if (!beachId || !currentUserUid || !currentUserEmail) {
        console.warn("No se pudo obtener beachId, UID o email de usuario");
        return;
    }

    try {
        let comments = await loadComments(beachId, currentUserUid);

        comments.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB - dateA;
        });

        const commentsList = document.getElementById("commentsList");
        commentsList.innerHTML = "";

        comments.forEach(comment => {
            const li = document.createElement("li");
            li.className = "comment-item";

            // Contenedor para email + posible papelera
            const ownerContainer = document.createElement("p");
            ownerContainer.className = "comment-owner";

            const ownerEmailSpan = document.createElement("span");
            ownerEmailSpan.textContent = comment.owner;
            ownerContainer.appendChild(ownerEmailSpan);

            if (comment.owner === currentUserEmail) {
                // Crear icono de papelera
                const trashIcon = document.createElement("img");
                trashIcon.src = "../Images/icono-papelera.png";
                trashIcon.alt = "Eliminar comentario";
                trashIcon.title = "Eliminar comentario";
                trashIcon.className = "trash-icon";
                trashIcon.style.cursor = "pointer";
                trashIcon.style.marginLeft = "8px";
                trashIcon.addEventListener("click", () => {
                    showDeleteConfirmPopup(comment.id, li);
                });
                ownerContainer.appendChild(trashIcon);
            }

            const textEl = document.createElement("p");
            textEl.className = "comment-text";
            textEl.textContent = comment.text;

            const fishImagesContainer = document.createElement("div");
            fishImagesContainer.className = "comment-fish-images";

            if (comment.fish && comment.fish.length > 0) {
                comment.fish.forEach(fishName => {
                    const fishData = allFish.find(f => f.name === fishName);
                    if (fishData && fishData.image) {
                        const img = document.createElement("img");
                        img.src = fishData.image;
                        img.alt = fishName;
                        img.title = fishName;
                        img.className = "fish-image-comment";
                        fishImagesContainer.appendChild(img);
                    }
                });
            }

            li.appendChild(ownerContainer);
            li.appendChild(textEl);
            li.appendChild(fishImagesContainer);
            commentsList.appendChild(li);
        });

    } catch (error) {
        console.error("Error mostrando comentarios:", error);
    }
}

//Eliminar comentario
function showDeleteConfirmPopup(commentId, commentElement) {
    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";

    // Crear popup
    const popup = document.createElement("div");
    popup.className = "popup-confirm";

    popup.innerHTML = `
        <p>¿Estás seguro que quieres eliminar este comentario?</p>
        <div class="popup-buttons">
            <button id="confirmDeleteBtn">Sí, eliminar</button>
            <button id="cancelDeleteBtn">Cancelar</button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Eventos botones
    document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
        try {
            await deleteCommentById(commentId);
            commentElement.remove();
            closePopup();
        } catch (error) {
            alert("Error eliminando comentario. Intenta de nuevo.");
            console.error(error);
        }
    });

    document.getElementById("cancelDeleteBtn").addEventListener("click", closePopup);

    function closePopup() {
        document.body.removeChild(overlay);
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


function mostrarRecomendaciones(jsonURL) {
    console.log("ejecuta recomendaciones");
    getDataJson(jsonURL);
    function getDataJson(url) {
        fetch(url, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.status}`);
            }
            return response.json();
        }).then(json => {
            console.log("uv");
            const uvIndex = json.current.uv;
            console.log(uvIndex);
            document.getElementById('recomendations').innerHTML = getRecomendation(uvIndex).replace(/\n/g, '<br>');
            document.getElementById('recomendations-final').textContent = 'Tenga cuidado con las superficies brillantes, como arena, agua y nieve, que reflejan los rayos UV y aumentan la exposición.';
        }).catch(error => {
            console.error("❌ Error al obtener datos del tiempo:", error);
        });
    }
}


function getRecomendation(uvIndex) {
    if (uvIndex <= 2) {
        document.getElementById("uv-icon").src = '../Images/uv-icons/uv-bajo.png';
        return 'Riesgo de daño por exposición al sol sin protección es mínimo.\n' +
            'La exposición al sol es segura, pero aún así se recomienda utilizar protección solar, especialmente si se expone durante un tiempo prolongado.\n' +
            'Se recomienda emplear gafas de sol en caso de ser un día de sol brillante, y en caso de ser propenso a quemaduras, cubrirse y usar un protector solar de amplio espectro SPF 30+. No es estrictamente necesario que se aplique protección solar.\n' +
            'El tiempo que tardaría la piel en quemarse varía en función del tipo. En este caso sería en torno a unos 60 minutos.\n';
    } else if (uvIndex <= 5) {
        document.getElementById("uv-icon").src = '../Images/uv-icons/uv-medio.png';
        return 'Riesgo de daño por exposición al sol sin protección es moderado.\n' +
            'Sobre la hora del mediodía debería permanecer a la sombra dado que el sol está más fuerte. En caso de estar al aire libre, podría usar ropa que le proteja de la exposición al sol, una gorra para minimizar la exposición solar del rostro, o unas gafas de sol que le bloqueen los rayos UV.\n' +
            'Se recomienda evitar la exposición prolongada al sol sin protección solar, y en dicho caso de que se exponga, emplear protector solar de amplio espectro SPF 30+ en zonas expuestas (como la cara, brazos o cuello), y aplicarlo cada 2 horas, incluso en caso de días nublados, o, después de nadar o sudar.\n' +
            'El tiempo que tardaría la piel en quemarse varía en función del tipo. En este caso sería en torno a unos 30-45 minutos.\n';
    } else if (uvIndex <= 7) {
        document.getElementById("uv-icon").src = '../Images/uv-icons/uv-alto.png';
        return 'Riesgo de daño por exposición al sol sin protección es alto. Es necesario protegerse la piel y los ojos para que no sufran daños.\n' +
            'Entre las 10 de la mañana hasta las 4 de la tarde debería de reducir el tiempo de exposición solar. En caso de estar al aire libre, buscar sombra o emplear ropa adecuada a la temperatura que le proteja de los rayos del sol.\n' +
            'Se aconseja aplicar protector solar SPF 30+ cada 2 horas, incluso si está nublado y después de nadar o sudar.\n' +
            'El tiempo que tardaría la piel en quemarse varía en función del tipo. En este caso sería en torno a unos 15-25 minutos.\n';
    } else if (uvIndex <= 10) {
        document.getElementById("uv-icon").src = '../Images/uv-icons/uv-muyalto.png';
        return 'Riesgo de daño por exposición al sol sin protección muy alto. Es necesario protegerse la piel y los ojos para que no sufran daños.\n' +
            'Entre las 10 de la mañana hasta las 4 de la tarde debería de reducir el tiempo de exposición solar. En caso de estar al aire libre, buscar sombra o emplear ropa adecuada a la temperatura que le proteja de los rayos del sol. La zona del rostro es más sensible, por lo que se aconseja llevar gorra o sombrero que le proteja del sol, o reaplicar crema solar con mayor frecuencia.\n' +
            'Se aconseja aplicar protector solar de amplio espectro SPF 50+ cada 2 horas, incluso si está nublado y después de nadar o sudar.\n' +
            'El tiempo que tardaría la piel en quemarse varía en función del tipo. En este caso sería en torno a unos 15 minutos.\n';
    } else {
        document.getElementById("uv-icon").src = '../Images/uv-icons/uv-extremo.png';
        return 'Riesgo de daño por exposición al sol sin protección muy alto. Es necesario protegerse la piel y los ojos para que no sufran daños.\n' +
            'Entre las 10 de la mañana hasta las 4 de la tarde debería de evitar la exposición solar. En caso de estar al aire libre, buscar sombra o emplear ropa adecuada a la temperatura que le proteja de los rayos del sol. La zona del rostro es más sensible, por lo que se aconseja llevar gorra o sombrero que le proteja del sol, o reaplicar crema solar con mayor frecuencia.\n' +
            'Se aconseja aplicar protector solar de amplio espectro SPF 50+ cada 2 horas, incluso si está nublado y después de nadar o sudar.\n' +
            'El tiempo que tardaría la piel en quemarse varía en función del tipo. En este caso podría llegar a darse en menos de 10 minutos en caso de no protegerse.\n';
    }
}
