
function initMap() {
    let map = L.map('map').setView([28.299, -16.413], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    function addMarkersToMap(zonas) {
        for (let lugar in zonas) {
            let lat = zonas[lugar][0];
            let lon = zonas[lugar][1];
            L.marker([lat, lon]).addTo(map)
                .bindPopup('<b>' + lugar + '</b>');
        }
    }


    fetch('../zonas.json')
        .then(response => response.json())
        .then(zonas => {
            addMarkersToMap(zonas);
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));

    fetch('../beaches.json')
        .then(response => response.json())
        .then(beaches => {

        })
}

