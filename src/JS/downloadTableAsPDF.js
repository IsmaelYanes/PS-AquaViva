function downloadCSVTableAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const table = document.getElementById("csv-table");
    if (!table) {
        alert("No se encontró la tabla para descargar.");
        return;
    }

    doc.autoTable({
        html: table,
        theme: "striped",
        headStyles: { fillColor: [200, 200, 200] },
        margin: { top: 10, left: 5, right: 5 },
        styles: { fontSize: 6, cellPadding: 1 },
        columnStyles: {
            0: { cellWidth: 15 }, // ID DGE
            1: { cellWidth: 25 }, // Nombre Playa o ZBM
        },
        didParseCell: (data) => {
            data.cell.styles.overflow = 'linebreak';
        },
    });

    doc.save("tabla_playas.pdf");
}