function toggleToolbar() {
    let content = document.getElementById("toolbar-content");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "flex"; // Mostrar en columna
    } else {
        content.style.display = "none"; // Ocultar
    }
}
