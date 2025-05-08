function initFishGallery() {
    fetch('../Data/fullfish.json')
        .then(response => response.json())
        .then(data => {
            const fishGrid = document.getElementById('fish-grid');
            if (!fishGrid) {
                console.error("No se encontró el elemento #fish-grid");
                return;
            }
            fishGrid.innerHTML = ''; // Limpia el contenedor por si acaso
            data.forEach(fish => {
                const fishItem = document.createElement('div');
                fishItem.classList.add('fish-item');

                const fishLink = document.createElement('a');
                fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.nom_commun)}`;

                const fishImage = document.createElement('img');
                fishImage.src = fish.image;
                fishImage.alt = fish.nom_commun || fish.name;

                const fishNameContainer = document.createElement('div');
                fishNameContainer.classList.add('fish-name-container');
                const fishName = document.createElement('h2');
                fishName.textContent = fish.nom_commun || fish.name;
                fishNameContainer.appendChild(fishName);

                fishLink.appendChild(fishImage);
                fishLink.appendChild(fishNameContainer);
                fishItem.appendChild(fishLink);
                fishGrid.appendChild(fishItem);
            });
        })
        .catch(error => console.error('Error al cargar los peces:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById('fish-grid')) {
        initFishGallery();
    }
});