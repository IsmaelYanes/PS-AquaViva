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

        // Aplicar búsqueda si hay query
        if (currentSearchQuery) {
            data = data.filter(row => {
                return visibleColumns.some(colIndex => {
                    return row[colIndex].toLowerCase().includes(currentSearchQuery);
                });
            });
        }

        data = data.map(row => visibleColumns.map(index => row[index]));

        // Dividir data en dos bloques
        const primerBloque = 18;
        const headersParte1 = headers.slice(0, primerBloque);
        const dataParte1 = data.map(row => row.slice(0, primerBloque));

        const headersParte2 = headers.slice(primerBloque);
        const dataParte2 = data.map(row => row.slice(primerBloque));

        doc.autoTable({
            head: [headersParte1],
            body: dataParte1,
            startY: 60,
            styles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [70, 130, 180],
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

        // Obtener posición final para colocar la segunda tabla
        const finalY = doc.lastAutoTable.finalY || 60;

        doc.autoTable({
            head: [headersParte2],
            body: dataParte2,
            startY: finalY + 20,
            styles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [70, 130, 180],
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
