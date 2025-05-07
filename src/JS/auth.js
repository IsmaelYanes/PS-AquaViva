import firebase from "firebase/compat";

const firebaseConfig = {
    apiKey: "AIzaSyCU3fXaXPHYdlb8q4ZKY4iHTmXyvjjpeuQ",
    authDomain: "playascanarias-f83a8.firebaseapp.com",
    projectId: "playascanarias-f83a8",
    storageBucket: "playascanarias-f83a8.appspot.com",
    messagingSenderId: "524034321433",
    appId: "1:524034321433:web:b81e26afdf44f82aa34e88",
    measurementId: "G-W53XJWVN58"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();


async function registrarUsuario(nombre, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Enviar correo de verificación
        await user.sendEmailVerification();

        // Crear documento vacío en Firestore solo con el UID como ID
        await db.collection("users").doc(user.uid).set({
            favoritos: [], // puedes iniciarlo vacío
            creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Te hemos enviado un correo de verificación. Verifica tu correo antes de cerrar esta pestaña.');
        window.location.href = "login.html";
    } catch (error) {
        alert('Error al crear cuenta: ' + error.message);
    }
}

async function reenviarVerificacion() {
    const user = firebase.auth().currentUser;
    if (user && !user.emailVerified) {
        await user.sendEmailVerification();
        alert("Correo de verificación reenviado.");
    } else {
        alert("Debes iniciar sesión con una cuenta no verificada.");
    }
}


// Función para iniciar sesión con correo y contraseña solo si el correo está verificado
async function iniciarSesion(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (userCredential.user.emailVerified) {
            alert('Inicio de sesión exitoso');
            guardarUsuarioActual();
            window.location.href = "../HTML/index.html";
        } else {
            alert('Por favor verifica tu correo electrónico antes de iniciar sesión.');
            await auth.signOut();
        }
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
}

// Función para iniciar sesión con Google (solo si ya está registrado)
async function iniciarSesionConGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await auth.signInWithPopup(provider);
        if (result.additionalUserInfo.isNewUser) {
            await auth.signOut();
            alert("Este correo no está registrado. Regístrate primero.");
            window.location.href = "register.html";
        } else {
            alert("Inicio de sesión con Google exitoso.");
            guardarUsuarioActual();
            window.location.href = "../HTML/index.html";
        }
    } catch (error) {
        alert("Error al iniciar sesión con Google: " + error.message);
    }
}

// Función para registrar con Google (solo si es nuevo)
async function registrarConGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await auth.signInWithPopup(provider);
        if (result.additionalUserInfo.isNewUser) {
            alert("Registro con Google exitoso.");
            window.location.href = "../HTML/index.html";
        } else {
            await auth.signOut();
            alert("Este correo ya está registrado. Inicia sesión en su lugar.");
            window.location.href = "login.html";
        }
    } catch (error) {
        alert("Error al registrar con Google: " + error.message);
    }
}

// Función para recuperar la contraseña
async function recuperarContrasena(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Correo de recuperación enviado');
    } catch (error) {
        alert('Error al enviar el correo: ' + error.message);
    }
}

// Detectar en qué página estamos y manejar formularios
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    const currentPage = window.location.pathname;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

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

        } else if (currentPage.includes('recover.html')) {
            const email = form['recover-email'].value;
            recuperarContrasena(email);
        }
    });

    // Botón de Google para login o registro
    const googleLoginButton = document.getElementById('google-login');
    if (googleLoginButton) {
        if (currentPage.includes('register.html')) {
            googleLoginButton.addEventListener('click', registrarConGoogle);
        } else if (currentPage.includes('login.html')) {
            googleLoginButton.addEventListener('click', iniciarSesionConGoogle);
        }
    }
});

function guardarUsuarioActual() {
    const user = firebase.auth().currentUser;

    if (user) {
        // Guardar el uid, email y token en localStorage
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", user.email);

        // Obtener el idToken y guardarlo en localStorage
        user.getIdToken().then((idToken) => {
            localStorage.setItem("idToken", idToken);
        });

        return user;
    } else {
        return null;
    }
}

async function comprobarUsuario() {
    // Comprobar si hay un usuario logueado usando Firebase
    const user = firebase.auth().currentUser;

    if (user) {
        // Imprimir el email del usuario en la consola si está autenticado
        console.log("Usuario autenticado: ", user.email);
        return true; // Usuario autenticado
    } else {
        console.log("No hay usuario autenticado.");
        return false; // No hay usuario autenticado
    }
}

async function cerrarSesion() {
    try {
        // Cerrar sesión en Firebase
        await firebase.auth().signOut();

        // Eliminar el UID, email y idToken del localStorage
        localStorage.removeItem("uid");
        localStorage.removeItem("email");
        localStorage.removeItem("idToken");

        console.log("✅ Sesión cerrada y datos eliminados de localStorage.");

        // Redirigir a la página de inicio o login después de cerrar sesión
        window.location.href = "login.html";
    } catch (error) {
        console.error("⚠️ Error al cerrar sesión:", error.message);
    }
}




