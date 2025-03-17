document.addEventListener("DOMContentLoaded", function() {
    fetch("../Templates/InfoPageBody.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("body-container").innerHTML = data;
        });

    fetch("../Templates/Menu.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("menu-container").innerHTML = data;
        });

});