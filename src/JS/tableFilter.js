
let originalData = [];
let visibleColumns = [];
let advancedFilters = {};
let currentSearchIndex = -1;
let searchMatches = [];
let currentSearchQuery = '';

function initFilters(headers, data) {
    originalData = data;
    visibleColumns = headers.map((_, index) => index);
    advancedFilters = {};
    currentSearchQuery = '';

    // Initialize filter container
    const filterButton = document.getElementById('filter-button');
    const filterContainer = document.getElementById('filter-container');
    const columnFilters = document.getElementById('column-filters');
    const advancedFilterOptions = document.getElementById('advanced-filter-options');
    const applyFilterButton = document.getElementById('apply-filter');
    const searchInput = document.getElementById('search-input');
    const searchNextButton = document.getElementById('search-next');

    // Toggle filter container
    filterButton.addEventListener('click', () => {
        filterContainer.classList.toggle('show');
    });

    // Populate column filters
    columnFilters.innerHTML = '';
    headers.forEach((header, index) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!visibleColumns.includes(index)) {
                    visibleColumns.push(index);
                    visibleColumns.sort((a, b) => a - b);
                }
            } else {
                visibleColumns = visibleColumns.filter(col => col !== index);
            }
            renderFilteredTable(); // Re-render table on column visibility change
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${header}`));
        columnFilters.appendChild(label);
    });

    // Populate advanced filters (fields with < 7 unique values)
    const uniqueValues = {};
    headers.forEach((header, colIndex) => {
        // Excluir la primera fila (encabezados) al calcular valores únicos
        const values = [...new Set(data.slice(1).map(row => row[colIndex]))].filter(v => v !== 'Desconocido');
        uniqueValues[header] = values;
    });

    advancedFilterOptions.innerHTML = '';
    headers.forEach((header, colIndex) => {
        const values = uniqueValues[header];
        if (values.length < 7 && values.length > 0) {
            const label = document.createElement('label');
            label.textContent = header;
            const select = document.createElement('select');
            select.multiple = true;
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
            select.addEventListener('change', () => {
                const selected = Array.from(select.selectedOptions).map(option => option.value);
                advancedFilters[header] = selected.length > 0 ? selected : null;
            });
            label.appendChild(select);
            advancedFilterOptions.appendChild(label);
        }
    });

    // Add clear filters button
    const clearFiltersButton = document.createElement('button');
    clearFiltersButton.textContent = 'Limpiar Filtros';
    clearFiltersButton.style.marginTop = '10px';
    clearFiltersButton.style.padding = '8px 16px';
    clearFiltersButton.style.cursor = 'pointer';
    clearFiltersButton.style.backgroundColor = '#dc3545';
    clearFiltersButton.style.color = 'white';
    clearFiltersButton.style.border = 'none';
    clearFiltersButton.style.borderRadius = '4px';
    clearFiltersButton.style.width = '100%';
    clearFiltersButton.addEventListener('click', () => {
        // Clear all advanced filter selections
        advancedFilterOptions.querySelectorAll('select').forEach(select => {
            Array.from(select.options).forEach(option => {
                option.selected = false;
            });
        });
        advancedFilters = {};
        renderFilteredTable();
        filterContainer.classList.remove('show');
    });
    advancedFilterOptions.appendChild(clearFiltersButton);

    // Apply filters
    applyFilterButton.addEventListener('click', () => {
        filterContainer.classList.remove('show');
        renderFilteredTable();
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        currentSearchIndex = -1;
        searchMatches = [];
        currentSearchQuery = searchInput.value.toLowerCase();
        renderFilteredTable(); // Re-render table with search query
    });

    searchNextButton.addEventListener('click', () => {
        if (searchMatches.length > 0) {
            currentSearchIndex = (currentSearchIndex + 1) % searchMatches.length;
            highlightMatches();
            searchMatches[currentSearchIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

function highlightMatches() {
    clearHighlights();
    searchMatches.forEach((match, index) => {
        if (index === currentSearchIndex) {
            match.element.classList.add('highlight');
            match.element.style.backgroundColor = '#4682B4'; // Azul más oscuro para el resultado actual
        } else {
            match.element.classList.add('highlight');
            match.element.style.backgroundColor = '#87CEEB'; // Azul claro para los resultados no actuales
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(cell => {
        cell.classList.remove('highlight');
        cell.style.backgroundColor = '';
    });
}

function renderFilteredTable() {
    const table = document.getElementById('csv-table');
    table.innerHTML = '';
    searchMatches = [];
    currentSearchIndex = -1;

    // Filter rows based on advanced filters
    let filteredData = originalData.filter(row => {
        return Object.keys(advancedFilters).every(header => {
            if (!advancedFilters[header]) return true;
            const colIndex = originalData[0].indexOf(header);
            return advancedFilters[header].includes(row[colIndex]);
        });
    });

    // Further filter rows based on search query
    if (currentSearchQuery) {
        filteredData = filteredData.filter(row => {
            return visibleColumns.some(colIndex => {
                return row[colIndex].toLowerCase().includes(currentSearchQuery);
            });
        });
    }

    // Render headers
    const thead = document.createElement('thead');
    const headTr = document.createElement('tr');
    visibleColumns.forEach(colIndex => {
        const th = document.createElement('th');
        th.textContent = originalData[0][colIndex];
        headTr.appendChild(th);
    });
    thead.appendChild(headTr);
    table.appendChild(thead);

    // Render rows and collect search matches
    const tbody = document.createElement('tbody');
    filteredData.slice(1).forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        visibleColumns.forEach(colIndex => {
            const td = document.createElement('td');
            td.textContent = row[colIndex];
            if (currentSearchQuery && td.textContent.toLowerCase().includes(currentSearchQuery)) {
                searchMatches.push({ rowIndex, colIndex, element: td });
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Highlight search matches if any
    if (searchMatches.length > 0) {
        highlightMatches();
    }
}

function updatePDFDownload() {
    const originalDownload = window.downloadCSVTableAsPDF;
    window.downloadCSVTableAsPDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'pt', 'a4');

        doc.setFontSize(14);
        doc.text("Tabla de Playas Filtrada", 40, 40);

        const headers = visibleColumns.map(index => originalData[0][index]);
        let data = originalData.slice(1)
            .filter(row => {
                return Object.keys(advancedFilters).every(header => {
                    if (!advancedFilters[header]) return true;
                    const colIndex = originalData[0].indexOf(header);
                    return advancedFilters[header].includes(row[colIndex]);
                });
            });

        // Apply search query to PDF data
        if (currentSearchQuery) {
            data = data.filter(row => {
                return visibleColumns.some(colIndex => {
                    return row[colIndex].toLowerCase().includes(currentSearchQuery);
                });
            });
        }

        data = data.map(row => visibleColumns.map(index => row[index]));

        doc.autoTable({
            head: [headers],
            body: data,
            startY: 60,
            styles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [0, 123, 255],
                textColor: [255, 255, 255],
                halign: 'center',
                fontSize: 8
            },
            bodyStyles: {
                halign: 'left',
                valign: 'top'
            },
            margin: { left: 40, right: 40 },
            theme: 'striped'
        });

        doc.save('tabla_playas_filtrada.pdf');
    };
}
