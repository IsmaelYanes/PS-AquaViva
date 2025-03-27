
function initMap() {
    let map = L.map('map').setView([28.299, -16.413], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    function addMarkersToMap(beaches) {
        for (let i = 0; i < beaches.length; i++) {
            let beach = beaches[i];
            let lat = Number(beach.LAT.replace(",", "."));
            let lon = 0 - (Number(beach.LOG.replace(",", ".")));
            console.log(lat, lon);
            L.marker([lat, lon]).addTo(map)
                .bindPopup('<b>' + beach.beachName + '</b>');
        }
    }
    fetch('../beaches.json')
        .then(response => response.json())
        .then(data => {
            addMarkersToMap(data)
        })

}


