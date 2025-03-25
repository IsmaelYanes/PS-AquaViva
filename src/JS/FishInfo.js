document.addEventListener("DOMContentLoaded", function() {
    fetch('../Data/fish.json')
        .then(response => response.json())
        .then(data => {
            const fishGrid = document.getElementById('fish-grid');

            data.forEach(fish => {
                const fishItem = document.createElement('div');
                fishItem.classList.add('fish-item');

                const fishLink = document.createElement('a');
                fishLink.href = "#";
                fishLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    showFishInfo(fish);
                });

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

function showFishInfo(fish) {
    const newPage = window.open("", "_blank");
    newPage.document.write(`
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${fish.name}</title>
            <style>
                body {
                    background-color: #0a0f1e;
                    color: white;
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .container {
                    margin-top: 50px;
                }
                img {
                    width: 300px;
                    height: 300px;
                    object-fit: contain;
                    border: 3px solid #0077ff;
                    border-radius: 10px;
                }
                h1 {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="${fish.image}" alt="${fish.name}">
                <h1>${fish.name}</h1>
            </div>
        </body>
        </html>
    `);
}
