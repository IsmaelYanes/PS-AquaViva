const sections = document.querySelectorAll('.section-info');
const navLinks = document.querySelectorAll('#sidebar-nav .nav-a');

// Función para actualizar la clase "active" según el scroll
function updateActiveLinkOnScroll() {
    let top = window.scrollY;
    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`#sidebar-nav .nav-a[href="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}

// Asignar scroll personalizado y marcar como activo al hacer clic
document.querySelectorAll('#sidebar-nav .nav-a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        const offset = 100;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

        // Scroll suave
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Marcar enlace como activo manualmente
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    });
});

// Ejecutar función al hacer scroll
window.addEventListener('scroll', updateActiveLinkOnScroll);
