let sections = document.querySelectorAll('.section-info');
let navLinks = document.querySelectorAll('#sidebar-nav .nav-a');
window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('#sidebar-nav .nav-a[href*=' + id + ']').classList.add('active');
            });
        };
    });
};