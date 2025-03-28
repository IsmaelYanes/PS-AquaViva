document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const fishName = params.get('name');

    if (fishName) {
        // Determinar si es "Raya Toro" y cargar el archivo correspondiente
        const fileToLoad = fishName === "Raya toro" ? '../Data/fullfish.json' : '../Data/fish.json';

        fetch(fileToLoad)
            .then(response => response.json())
            .then(data => {
                const fish = data.find(f => f.name === fishName);
                if (fish) {
                    // Rellenar los campos con los datos de fullfish.json o fish.json
                    document.getElementById('fish-title').textContent = fish.name;
                    document.getElementById('scientific-name').textContent = fish.sciname || 'No disponible';
                    document.getElementById('fish-image').src = fish.image;
                    document.getElementById('fish-image').alt = fish.name;
                    document.getElementById('description').textContent = fish.description || 'No disponible';
                    document.getElementById('iucn').textContent = fish.IUCN || 'No disponible';
                    document.getElementById('gender-description').textContent = fish.genderDescription || 'No disponible';
                    document.getElementById('type').textContent = fish.type || 'No disponible';
                    document.getElementById('average-size').textContent = fish.size || 'No disponible';
                    document.getElementById('max-size').textContent = fish.maxSize || 'No disponible';
                    document.getElementById('mimetism').textContent = fish.mimetism || 'No disponible';
                    document.getElementById('recognize').textContent = fish.recognize || 'No disponible';
                    document.getElementById('male-female-differences').textContent = fish.feMaleDifferences || 'No disponible';
                    document.getElementById('diet').textContent = fish.diet || 'No disponible';
                    document.getElementById('territorial').textContent = fish.territorial || 'No disponible';
                    document.getElementById('life-mode').textContent = fish.lifeMode || 'No disponible';
                    document.getElementById('life-description').textContent = fish.lifeDescription || 'No disponible';
                    document.getElementById('reproduction-mode').textContent = fish.reproductionMode || 'No disponible';
                    document.getElementById('migration').textContent = fish.migration || 'No disponible';
                    document.getElementById('reproduction-description').textContent = fish.reproductionDescription || 'No disponible';
                    document.getElementById('poison').textContent = fish.poison === "No" ? 'No' : 'Sí';
                    document.getElementById('danger').textContent = fish.danger || 'No disponible';
                    document.getElementById('depth-range').textContent = fish.depth || 'No disponible';
                    document.getElementById('map-image').src = fish.mapImage || '';
                } else {
                    console.error('Pez no encontrado');
                }
            })
            .catch(error => console.error('Error al cargar la información del pez:', error));
    } else {
        console.error('No se proporcionó el nombre del pez en la URL');
    }
});
