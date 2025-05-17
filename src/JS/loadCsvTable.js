function loadCSVTable(csvPath) {
    fetch(csvPath)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').filter(row => row.trim() !== '');
            const table = document.getElementById('csv-table');
            table.innerHTML = '';

            if (rows.length === 0) return;

            // Primera fila como encabezado
            const headerRow = rows[0].split(';');
            const thead = document.createElement('thead');
            const headTr = document.createElement('tr');
            headerRow.forEach(cell => {
                const cleaned = cell.trim().replace(/^"|"$/g, '');
                const value = (!cleaned || cleaned.toLowerCase() === 'null') ? "Desconocido" : cleaned;
                const th = document.createElement('th');
                th.textContent = value;
                headTr.appendChild(th);
            });
            thead.appendChild(headTr);
            table.appendChild(thead);

            // Filas de datos
            const tbody = document.createElement('tbody');
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].split(';');
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const cleaned = cell.trim().replace(/^"|"$/g, '');
                    const value = (!cleaned || cleaned.toLowerCase() === 'null') ? "Desconocido" : cleaned;
                    const td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
        })
        .catch(error => {
            console.error('Error cargando el archivo CSV:', error);
            document.getElementById('csv-table').innerHTML = '<tr><td colspan="100%">Error al cargar la tabla</td></tr>';
        });
}