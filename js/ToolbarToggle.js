function toggleToolbar() {
    let toolbar = document.getElementById("toolbar");
    let content = document.getElementById("toolbar-content");

    toolbar.classList.toggle("expanded");

    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "flex";
    } else {
        content.style.display = "none";
    }
}
