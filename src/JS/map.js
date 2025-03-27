
function initMap() {
    let map = L.map('map').setView([28.299, -16.413], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let beachIcon = L.icon({
        iconUrl: 'D:\\Uni\\PSS\\src\\image\\beach.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    let ZBMIcon = L.icon({
        iconUrl: 'https://e7.pngegg.com/pngimages/660/961/png-clipart-beach-icon-design-icon-beach-leaf-orange.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    function addMarkersToMap(beaches) {
        for (let i = 0; i < beaches.length; i++) {
            let beach = beaches[i];
            let lat = Number(beach.LAT.replace(",", "."));
            let lon = 0 - (Number(beach.LOG.replace(",", ".")));
            let markerIcon = beach.type === 'playa' ? beachIcon : ZBMIcon;
            L.marker([lat, lon], { icon: markerIcon }).addTo(map)
                .bindPopup('<b>' + beach.beachName + '</b>');
        }
    }


    fetch('../Data/beaches.json')
        .then(response => response.json())
        .then(data => {
            addMarkersToMap(data)
        })

}


