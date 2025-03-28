document.addEventListener("DOMContentLoaded", function() {
    fetch("../HTML-components/services.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("body-container").innerHTML = data;
        });

    fetch("../HTML-components/Menu.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("menu-container").innerHTML = data;
        });

});