function loadCSVTable(csvPath) {
    fetch(csvPath)
        .then(response => response.text())
        .then(data => {
            // Limpieza más agresiva del CSV
            const rows = data
                .split('\n')
                .filter(row => row.trim() !== '')
                .map(row => row.split(';').map(cell => {
                    let cleaned = cell.trim()
                        .replace(/^"|"$/g, '')
                        .replace(/""/g, '"');
                    return (cleaned === '' || cleaned.toLowerCase() === 'null') ? "Desconocido" : cleaned;
                }));

            // Asegurar que todas las filas tengan el mismo número de columnas
            const maxColumns = Math.max(...rows.map(row => row.length));
            const paddedRows = rows.map(row => {
                while (row.length < maxColumns) row.push("Desconocido");
                return row;
            });

            originalData = paddedRows;

            if (typeof initFilters === 'function') {
                initFilters(originalData[0], originalData);
                updatePDFDownload();
                renderFilteredTable();
            }
        })
        .catch(error => console.error('Error:', error));
}