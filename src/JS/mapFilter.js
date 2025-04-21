const beachFacilities = [
    "Aparcamientos",
    "Aseo",
    "Lavapies",
    "Duchas",
    "Alquiler de sombrillas",
    "Alquiler de hamacas",
    "Alquiler nautico",
    "Area Infantil",
    "Area Deportiva"
]
const provinceList = ["Las Palmas", "Santa Cruz de Tenerife"];

const islandList= [
    "Tenerife",
    "Gran Canaria",
    "Lanzarote",
    "Fuerteventura",
    "La Palma",
    "La Gomera",
    "El Hierro"
]
const townPerIsland = {
    "Gran Canaria": [
        "Las Palmas de Gran Canaria",
        "Telde",
        "Santa Lucía de Tirajana",
        "San Bartolomé de Tirajana",
        "Arucas",
        "Ingenio",
        "Agüimes",
        "Gáldar",
        "Santa Brígida",
        "Mogán",
        "Santa María de Guía",
        "Teror",
        "Valsequillo de Gran Canaria",
        "Moya",
        "Firgas",
        "La Aldea de San Nicolás",
        "Tejeda",
        "Valleseco",
        "Vega de San Mateo",
        "Artenara",
        "Agaete"
    ],
    "Fuerteventura": [
        "Puerto del Rosario",
        "La Oliva",
        "Pájara",
        "Antigua",
        "Tuineje",
        "Betancuria"
    ],
    "Lanzarote": [
        "Arrecife",
        "Teguise",
        "Tías",
        "San Bartolomé",
        "Yaiza",
        "Haría",
        "Tinajo"
    ],
    "Tenerife": [
        "Santa Cruz de Tenerife",
        "San Cristóbal de La Laguna",
        "Arona",
        "La Orotava",
        "Los Realejos",
        "Granadilla de Abona",
        "Adeje",
        "Puerto de la Cruz",
        "Candelaria",
        "San Miguel de Abona",
        "Icod de los Vinos",
        "Güímar",
        "Tacoronte",
        "El Rosario",
        "Guía de Isora",
        "La Victoria de Acentejo",
        "La Matanza de Acentejo",
        "El Sauzal",
        "Tegueste",
        "San Juan de la Rambla",
        "Santiago del Teide",
        "Fasnia",
        "Arafo",
        "Arico",
        "Vilaflor de Chasna",
        "Buenavista del Norte",
        "Los Silos",
        "Garachico",
        "El Tanque",
        "Santa Úrsula",
        "La Guancha"
    ],
    "La Palma": [
        "Santa Cruz de La Palma",
        "Los Llanos de Aridane",
        "El Paso",
        "Tazacorte",
        "San Andrés y Sauces",
        "Barlovento",
        "Puntallana",
        "Puntagorda",
        "Tijarafe",
        "Garafía",
        "Villa de Mazo",
        "Fuencaliente de La Palma",
        "Breña Alta",
        "Breña Baja"
    ],
    "La Gomera": [
        "San Sebastián de La Gomera",
        "Vallehermoso",
        "Agulo",
        "Hermigua",
        "Alajeró",
        "Valle Gran Rey"
    ],
    "El Hierro": [
        "Valverde",
        "La Frontera",
        "El Pinar de El Hierro"
    ]
};

const environmentList = [
    "Urbana",
    "Semiurbana",
    "Aislada"
]

const bathConditionList = [
    "Aguas tranquilas",
    "Ventosa",
    "Oleaje moderado",
    "Oleaje fuerte",
    "Oleaje moderado"
]

const accessConditionList = [
    "A pie fácil",
    "Coche",
    "Barco",
    "A pie dificultad media",
    "A pie difícil"
]
const influenceList = [
    "Baja",
    "Media",
    "Alta"
]

function completeFilter(id, list){
    const filter = document.getElementById(id);
    list.forEach(l => {
        const option = document.createElement("option");
        option.textContent = l;
        option.value = l;
        filter.appendChild(option);
    })
}

function completeTownFilter(townList){
    const townFilter = document.getElementById("townFilter");
    const islandSelected = document.getElementById("islandFilter").value;
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todos los municipios";
    townFilter.innerHTML = "";
    townFilter.appendChild(defaultOption);
    if (islandSelected === "") {
        const allTowns = Object.values(townList)
            .flat()
            .sort((a, b) => a.localeCompare(b));
        completeFilter("townFilter", allTowns);
    }else {
        const townSelectedList = townList[islandSelected];
        completeFilter("townFilter", townSelectedList);
    }
}

function completeCheckBoxSection(id, facilities){
    const container = document.getElementById(id);
    facilities.forEach(facility => {
        const label = document.createElement("label");
        label.classList.add("checkboxLabel");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = facility;
        input.classList.add("checkboxInput");
        label.textContent = facility;
        label.prepend(input);
        container.appendChild(label);
    })

}

function initFilters(){
    const islandFilter = document.getElementById("islandFilter");
    islandFilter.addEventListener("change", () => completeTownFilter(townPerIsland));
    completeFilter("islandFilter", islandList);
    completeTownFilter(townPerIsland);
    completeFilter("bathingConditionFilter", bathConditionList);
    completeFilter("accessConditionFilter", accessConditionList);
    completeFilter("InfluenceFilter", influenceList);
    completeFilter("environmentConditionFilter", environmentList);
    completeCheckBoxSection("checkbox-container", beachFacilities);
}
