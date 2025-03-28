document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const fishName = params.get('name');

    if (fishName) {
        fetch('../Data/fish.json')
            .then(response => response.json())
            .then(data => {
                const fish = data.find(f => f.name === fishName);
                if (fish) {
                    document.getElementById('fish-title').textContent = fish.name;
                    document.getElementById('fish-name').textContent = fish.name;
                    document.getElementById('scientific-name').textContent = fish.scientificName;
                    document.getElementById('fish-image').src = fish.image;
                    document.getElementById('fish-image').alt = fish.name;
                    document.getElementById('description').textContent = fish.description;
                    document.getElementById('average-size').textContent = fish.averageSize;
                    document.getElementById('max-size').textContent = fish.maxSize;
                    document.getElementById('reproduction-type').textContent = fish.reproductionType;
                    document.getElementById('venomous').textContent = fish.venomous ? 'Sí' : 'No';
                    document.getElementById('depth-range').textContent = fish.depthRange;
                } else {
                    console.error('Pez no encontrado');
                }
            })
            .catch(error => console.error('Error al cargar la información del pez:', error));
    } else {
        console.error('No se proporcionó el nombre del pez en la URL');
    }
});
