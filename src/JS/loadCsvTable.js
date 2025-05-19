function loadCSVTable(csvPath) {
    // Load table component HTML
    fetch('../HTML-components/tableComponent.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('tabla-container').innerHTML = html;
            // Load CSV data
            return fetch(csvPath);
        })
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').filter(row => row.trim() !== '');
            const table = document.getElementById('csv-table');
            table.innerHTML = '';

            if (rows.length === 0) return;

            // Parse data
            const parsedData = rows.map(row => {
                return row.split(';').map(cell => {
                    const cleaned = cell.trim().replace(/^"|"$/g, '');
                    return (!cleaned || cleaned.toLowerCase() === 'null') ? "Desconocido" : cleaned;
                });
            });

            // Initialize filters
            if (typeof initFilters === 'function') {
                initFilters(parsedData[0], parsedData);
                updatePDFDownload();
            }

            // Initial render
            renderFilteredTable();
        })
        .catch(error => {
            console.error('Error cargando el archivo CSV o el componente:', error);
            document.getElementById('tabla-container').innerHTML = '<p>Error al cargar la tabla.</p>';
        });
}