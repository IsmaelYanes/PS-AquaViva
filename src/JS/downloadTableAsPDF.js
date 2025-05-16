function downloadCSVTableAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'pt', 'a4'); // orientación horizontal

    doc.setFontSize(14);
    doc.text("Tabla de Playas", 40, 40);

    const table = document.getElementById("csv-table");
    const headers = [];
    const data = [];

    // Procesar encabezados
    const ths = table.querySelectorAll("thead tr th");
    ths.forEach(th => headers.push(th.textContent.trim() || "Desconocido"));

    // Procesar filas
    const trs = table.querySelectorAll("tbody tr");
    trs.forEach(tr => {
        const row = [];
        tr.querySelectorAll("td").forEach(td => {
            let text = td.textContent.trim();
            if (text.toLowerCase() === "null" || text === "") text = "Desconocido";
            row.push(text);
        });
        data.push(row);
    });

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

    doc.save('tabla_playas.pdf');
}
