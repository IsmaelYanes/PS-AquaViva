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
        input.name = "facilities";
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
    const button = document.getElementById("filterButton");
    button.addEventListener("click", initAdvancedSearch);
}

class AdvancedSearcher{
    constructor() {
        this.beachNameInput = document.getElementById("filterName").value;
        this.islandSelect = document.getElementById("islandFilter").value;
        this.townSelect = document.getElementById("townFilter").value;
        this.bathingCondition = document.getElementById("bathingConditionFilter").value;
        this.accessCondition = document.getElementById("accessConditionFilter").value;
        this.influenceCondition = document.getElementById("InfluenceFilter").value;
        this.environmentCondition = document.getElementById("InfluenceFilter").value;
        this.bathType = document.getElementById("zoneTypeFilter").value;
        this.facilities = Array.from(
            document.querySelectorAll("input[name='facilities']:checked"))
            .map(checkbox => checkbox.value);
    }

    getResultsOfFilter(beachesList){
        const results = [];
        beachesList.forEach(beach => {
            if (this.filterBeach(beach)) {
                results.push(beach)}
        })
        return results;
    }

    getBeachName(beach){
        return beach.fields.beachName.stringValue;
    }
    getIsland(beach){
        return beach.fields.island?.stringValue;
    }
    getTown(beach){
        return beach.fields.town?.stringValue;
    }
    getBathingCondition(beach){
        return beach.fields["Condiciones de baño"]?.stringValue;
    }
    getAccessCondition(beach){
        return beach.fields["Condiciones de acceso"]?.stringValue;
    }
    getInfluenceCondition(beach){
        return beach.fields.maxAnnualInflux?.stringValue;
    }
    getEnvironmentCondition(beach){
        return beach.fields["Condiciones de entorno"]?.stringValue;
    }
    getBathTypeCondition(beach){
        return beach.fields.type?.stringValue;
    }
    getFacilitiesCondition(beach){
        const facilities = {
            "Aparcamientos": beach.fields.Aparcamientos?.stringValue,
            "Aseo": beach.fields.Aseo?.stringValue,
            "Lavapies": beach.fields.Lavapies?.stringValue,
            "Duchas": beach.fields.Duchas?.stringValue,
            "Alquiler de sombrillas": beach.fields["Alquiler de sombrillas"]?.stringValue,
            "Alquiler de hamacas": beach.fields["Alquiler de hamacas"]?.stringValue,
            "Alquiler nautico": beach.fields["Alquiler nautico"]?.stringValue,
            "Area Infantil": beach.fields["Area Infantil"]?.stringValue,
            "Area Deportiva": beach.fields["Area Deportiva"]?.stringValue,
        };
        return Object.entries(facilities)
            .filter(([_, value]) => value === "Si")
            .map(([key]) => key);
    }


    filterBeach(beach){
        const name = !(this.beachNameInput) || this.getBeachName(beach).toLowerCase().includes(this.beachNameInput);
        const island = !(this.islandSelect) || this.islandSelect === (this.getIsland(beach));
        const town = !(this.townSelect) || this.townSelect === (this.getTown(beach));
        const bathing = !(this.bathingCondition) || this.getBathingCondition(beach).includes(this.bathingCondition);
        const access = !(this.accessCondition) || this.getAccessCondition(beach).includes(this.accessCondition);
        const influence = !(this.influenceCondition) || this.influenceCondition === (this.getInfluenceCondition(beach));
        const environmentCondition = !(this.environmentCondition) || this.environmentCondition === (this.getEnvironmentCondition(beach));
        const bath = !(this.bathType) || this.bathType === (this.getBathTypeCondition(beach));
        const facilities = !(this.facilities) || this.facilities.every(facility => this.getFacilitiesCondition(beach).includes(facility));
        return name & island & town & bathing & access & influence & environmentCondition & bath & facilities;
    }

}

function initAdvancedSearch(){
    const advancedSearch = new AdvancedSearcher();
    const result = advancedSearch.getResultsOfFilter(beachSearcher.getBeachesList());
    showFilteredBeaches(result);
}