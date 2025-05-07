class BeachSearcher {
    constructor() {
        this.selectedIndex = -1;
        this.beaches = [];
        this.beachesInfo = [];
        this.initElements();
    }

    initElements() {
        this.searcher = document.getElementById("search");
        this.resultList = document.getElementById("resultList");
        this.searchButton = document.getElementById("search-button");
    }

    async init() {
        this.beaches = await fetchAllBeaches();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searcher.addEventListener("input", () => this.handleSearchInput());
        document.addEventListener("click", (e) => this.handleDocumentClick(e));
        this.searchButton.addEventListener("click", () => this.handleSearchClick());
        this.searcher.addEventListener('keydown', (e) => this.handleKeyEvents(e));
        this.movementOfSearcher();
    }

    handleSearchInput() {
        const searchText = this.searcher.value.trim().toLowerCase();

        if (searchText.length === 0) {
            this.clearResults();
            return;
        }

        this.filterBeaches(searchText);
        this.displayResults();
    }

    filterBeaches(searchText) {
        this.beachesInfo = this.beaches
            .filter(beach =>
                beach.fields.beachName.stringValue.toLowerCase().includes(searchText)
            )
            .slice(0, 6)
            .map(beach => beach.fields);
    }

    displayResults() {
        this.clearResults();

        this.beachesInfo.forEach(beach => {
            const li = this.createBeachListItem(beach);
            this.resultList.appendChild(li);
        });
    }

    movementOfSearcher() {
        const buscadorContainer = document.querySelector('.buscador-container');
        const resultListContainer = document.getElementById('results-searcher');

        this.searcher.addEventListener('input', () => {
            const resultados = this.resultList.querySelectorAll('li').length;
            const alturaExtra = Math.min(resultados, 10) * 3;

            buscadorContainer.style.marginBottom = `${alturaExtra}em`;
            const valor = this.searcher.value.trim();

            if (valor.length === 0) {
                this.resultList.innerHTML = '';
                buscadorContainer.style.marginBottom = '0px';
                resultListContainer.style.display = 'none';
            } else {
                resultListContainer.style.display = 'block';
            }
        });
    }

    createBeachListItem(beach) {
        const li = document.createElement("li");
        li.textContent = beach.beachName.stringValue;
        li.classList.add("beach-item");
        li.setAttribute("lat", beach.LAT.stringValue);
        li.setAttribute("lon", beach.LOG.stringValue);
        li.setAttribute("id", beach["ID DGE"]?.integerValue);

        li.addEventListener("click", () => this.selectBeach(li));
        return li;
    }

    selectBeach(listItem) {
        this.searcher.value = listItem.textContent;
        this.searcher.setAttribute("lat", listItem.getAttribute("lat"));
        this.searcher.setAttribute("lon", listItem.getAttribute("lon"));
        this.searcher.setAttribute("id", listItem.getAttribute("id"));
        this.searcher.focus();
        this.clearResults();
    }

    handleDocumentClick(e) {
        const isClickInside = this.searcher.contains(e.target) ||
            e.target.classList.contains("beach-item");
        if (!isClickInside) {
            this.clearResults();
            this.searcher.value = "";
        }
    }

    handleSearchClick() {
        const lat = this.searcher.getAttribute("lat")?.replace(",", ".");
        const lon = this.searcher.getAttribute("lon")?.replace(",", ".");
        const id = this.searcher.getAttribute("id");

        if (lat && lon && id) {
            const url = `../HTML/MoreInfoPage.html?id=${id}&lat=${lat}&lon=-${lon}`;
            window.location.href = url;
        }else {
            alert("No encuentra la playa que busca")
        }
    }

    handleKeyEvents(e) {
        if (e.key === 'Enter' && this.selectedIndex === -1) {
            this.handleSearchClick();
        } else {
            this.navigateResults(e);
        }
    }

    navigateResults(e) {
        const listItems = Array.from(this.resultList.getElementsByTagName('li'));

        switch(e.key) {
            case 'ArrowDown':
                this.selectedIndex = Math.min(this.selectedIndex + 1, listItems.length - 1);
                break;
            case 'ArrowUp':
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                break;
            case 'Enter':
                if (this.selectedIndex >= 0) {
                    listItems[this.selectedIndex].click();
                    this.selectedIndex = -1;
                }
                break;
            default:
                return;
        }

        this.updateSelectedItem(listItems);
    }

    updateSelectedItem(listItems) {
        listItems.forEach((li, index) => {
            li.classList.toggle('selected', index === this.selectedIndex);
        });
    }

    clearResults() {
        this.resultList.innerHTML = "";
    }

    getBeachesList() {
        return this.beaches;
    }
}

// Inicialización
let beachSearcher;
function initSearcher(){
    beachSearcher = new BeachSearcher();
    beachSearcher.init();
}