function loadCSVTable(csvPath) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    fetch(csvPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching CSV: ${response.status}`);
            }
            return response.text();
        })
        .then(csv => {
            const lines = csv.trim().split("\n");
            const table = document.getElementById("csv-table");
            if (!table) {
                console.error("Table element not found");
                return;
            }
            table.innerHTML = "";

            const headers = lines[0].split(";");
            const headerRow = document.createElement("tr");
            headers.forEach(header => {
                const th = document.createElement("th");
                th.textContent = header;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            lines.slice(1).forEach(line => {
                const cols = line.split(";");
                if (id && cols[0] !== id) return; // Filter by ID DGE
                const row = document.createElement("tr");
                cols.forEach(col => {
                    const td = document.createElement("td");
                    td.textContent = col.replace(/"/g, ""); // Remove quotes
                    row.appendChild(td);
                });
                table.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error cargando CSV:", err);
            const container = document.getElementById("tabla-container");
            if (container) {
                container.innerHTML = "<p>Error al cargar la tabla de playas.</p>";
            }
        });
}