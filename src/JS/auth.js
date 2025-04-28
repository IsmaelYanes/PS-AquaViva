const firebaseConfig = {
    apiKey: "AIzaSyCU3fXaXPHYdlb8q4ZKY4iHTmXyvjjpeuQ",
    authDomain: "playascanarias-f83a8.firebaseapp.com",
    projectId: "playascanarias-f83a8",
    storageBucket: "playascanarias-f83a8.firebasestorage.app",
    messagingSenderId: "524034321433",
    appId: "1:524034321433:web:b81e26afdf44f82aa34e88",
    measurementId: "G-W53XJWVN58"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

async function registrarUsuario(nombre, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Cuenta creada exitosamente');
        window.location.href = "login.html";
    } catch (error) {
        alert('Error al crear cuenta: ' + error.message);
    }
}

async function iniciarSesion(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert('Inicio de sesión exitoso');
        window.location.href = "../HTML/index.html";
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPage = window.location.pathname;

        if (currentPage.includes('register.html')) {
            const nombre = form['nombre'].value;
            const email = form['email'].value;
            const password = form['contrasena'].value;
            const confirmPassword = form['re-contrasena'].value;

            registrarUsuario(nombre, email, password, confirmPassword);

        } else if (currentPage.includes('login.html')) {
            const email = form['email'].value;
            const password = form['password'].value;

            iniciarSesion(email, password);
        }
    });
});
