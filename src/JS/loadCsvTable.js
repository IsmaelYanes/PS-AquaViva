function loadCSVTable(csvPath) {
    fetch(csvPath)
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
            console.error('Error cargando el archivo CSV:', error);
            document.getElementById('csv-table').innerHTML = '<tr><td colspan="100%">Error al cargar la tabla</td></tr>';
        });
}