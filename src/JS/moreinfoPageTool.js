document.addEventListener("DOMContentLoaded", function () {
    init();
    detectSourceAndLoad();
});

let defaultPage;
let coordLAT;
let coordLON;

function detectSourceAndLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const lat = urlParams.get("lat");
    const lon = urlParams.get("lon");

    if (id) {
        defaultPage = '../HTML-components/services.html';
        document.getElementById('fishes-by-x').innerText = 'Peces por playas';
        loadTemplate(defaultPage, document.getElementById('services'), initBeach);
        loadTemplate(`../HTML-components/mainWeather.html?lat=${lat}&lon=${lon}`, document.getElementById('weather'), initWeather);
        loadTemplate('../HTML-components/dynamicSwell.html', document.getElementById('swell'), initializeSwellPage);
        loadTemplate('../HTML-components/wave.html', document.getElementById('tide'), initWavePage);
        loadTemplate(`../HTML-components/FishByZone.html?lat=${lat}&lon=${lon}`, document.getElementById('fish'), initFishByZone);
        loadTemplate('../HTML-components/fishPrediction.html', document.getElementById('fish-activity'), loadPrediction);
        loadTemplate('../HTML-components/tableComponent.html', document.getElementById('tabla-container'), () => {
            loadCSVTable('../data/beaches_table.csv');
        });

    } else if (lat && lon) {
        coordLAT = lat;
        coordLON = lon;
        defaultPage = `../HTML-components/mainWeather.html?lat=${lat}&lon=${lon}`;
        document.getElementById('services').style.display = 'none';
        document.getElementById('services-link').style.display = 'none';
        document.getElementById('services-br').style.display = 'none';
        loadTemplate(defaultPage, document.getElementById('weather'), initWeather);
        loadTemplate('../HTML-components/dynamicSwell.html', document.getElementById('swell'), initializeSwellPage);
        loadTemplate('../HTML-components/wave.html', document.getElementById('tide'), initWavePage);
        loadTemplate(`../HTML-components/FishByZone.html?lat=${lat}&lon=${lon}`, document.getElementById('fish'), initFishByZone);
        loadTemplate('../HTML-components/fishPrediction.html', document.getElementById('fish-activity'), loadPrediction);
        loadTemplate('../HTML-components/tableComponent.html', document.getElementById('tabla-container'), () => {
            loadCSVTable('../data/beaches_table.csv');
        });

    } else {
        defaultPage = '../HTML-components/mainWeather.html';
        document.getElementById('services').style.display = 'none';
        document.getElementById('services-link').style.display = 'none';
        document.getElementById('services-br').style.display = 'none';
        loadTemplate(defaultPage, document.getElementById('weather'), initWeather);
        loadTemplate('../HTML-components/dynamicSwell.html', document.getElementById('swell'), initializeSwellPage);
        loadTemplate('../HTML-components/wave.html', document.getElementById('tide'), initWavePage);
        loadTemplate(`../HTML-components/FishByZone.html?lat=${coordLAT}&lon=${coordLON}`, document.getElementById('fish'), initFishByZone);
        loadTemplate('../HTML-components/fishPrediction.html', document.getElementById('fish-activity'), loadPrediction);
        loadTemplate('../HTML-components/tableComponent.html', document.getElementById('tabla-container'), () => {
            loadCSVTable('../data/beaches_table.csv');
        });
    }
    loadTemplate('../HTML-components/FishInfo.html', document.getElementById('gallery'), initFishGallery);
    console.log("Cargando página por defecto: " + defaultPage);
}

function loadTemplate(fileName, element, callback) {
    if (!element) {
        console.error("Elemento no encontrado para", fileName);
        return;
    }

    fetch(fileName)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Error cargando ${fileName}: ${res.status}`);
            }
            return res.text();
        })
        .then((text) => {
            element.innerHTML = text;
            // Execute inline scripts
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const scripts = doc.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src) {
                    // Load external scripts
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.async = false;
                    document.body.appendChild(newScript);
                } else {
                    // Execute inline scripts
                    const newScript = document.createElement('script');
                    newScript.text = script.textContent;
                    document.body.appendChild(newScript);
                }
            }
            if (callback) {
                // Delay callback to ensure scripts are loaded
                setTimeout(callback, 0);
            }
        })
        .catch((error) => {
            console.error("Error al cargar componente:", error);
            element.innerHTML = '<p>Error al cargar el contenido.</p>';
        });
}

function init() {
    loadTemplate('../HTML-components/header.html', document.getElementById('header'));
}

function initFishByZone() {
    if (typeof window.initFishByZoneGallery === 'function') {
        window.initFishByZoneGallery();
    } else {
        console.error("initFishByZoneGallery no está definido");
        // Fallback: Try loading FishByZone.js manually
        const script = document.createElement('script');
        script.src = '../JS/FishByZone.js';
        script.onload = () => {
            if (typeof window.initFishByZoneGallery === 'function') {
                window.initFishByZoneGallery();
            } else {
                console.error("Failed to load initFishByZoneGallery after manual load");
            }
        };
        script.onerror = () => console.error("Error loading FishByZone.js manually");
        document.body.appendChild(script);
    }
}



const sections = document.querySelectorAll('.section-info');
const navLinks = document.querySelectorAll('#sidebar-nav .nav-a');

// Función para actualizar la clase "active" según el scroll
function updateActiveLinkOnScroll() {
    let top = window.scrollY;
    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`#sidebar-nav .nav-a[href="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}

// Asignar scroll personalizado y marcar como activo al hacer clic
document.querySelectorAll('#sidebar-nav .nav-a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        const offset = 100;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        // Scroll suave
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Marcar enlace como activo manualmente
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
});

// Ejecutar función al hacer scroll
window.addEventListener('scroll', updateActiveLinkOnScroll);
window.addEventListener('load', () => {
    updateActiveLinkOnScroll();
});
