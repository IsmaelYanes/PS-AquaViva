document.addEventListener("DOMContentLoaded", function() {
    fetch('../Data/fish.json')
        .then(response => response.json())
        .then(data => {
            const fishGrid = document.getElementById('fish-grid');

            data.forEach(fish => {
                const fishItem = document.createElement('div');
                fishItem.classList.add('fish-item');

                const fishLink = document.createElement('a');
                fishLink.href = `../HTML-components/FishDetail.html?name=${encodeURIComponent(fish.name)}`;

                const fishImage = document.createElement('img');
                fishImage.src = fish.image;
                fishImage.alt = fish.name;

                const fishName = document.createElement('h2');
                fishName.textContent = fish.name;

                fishLink.appendChild(fishImage);
                fishLink.appendChild(fishName);
                fishItem.appendChild(fishLink);
                fishGrid.appendChild(fishItem);
            });
        })
        .catch(error => console.error('Error al cargar los peces:', error));
});
