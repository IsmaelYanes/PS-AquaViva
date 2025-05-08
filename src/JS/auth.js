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

// ---------------------- FUNCIONES DE USUARIO ----------------------

async function registrarUsuario(nombre, email, password, confirmPassword) {
    const erroresValidacion = validarContrasena(password);
    if (password !== confirmPassword) {
        erroresValidacion.push("Las contraseñas no coinciden.");
    }

    if (erroresValidacion.length > 0) {
        mostrarError("signUpError", "Errores:\n- " + erroresValidacion.join("\n- "));
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await user.sendEmailVerification();

        await db.collection("users").doc(user.uid).set({
            nombre,
            favoritos: [],
            creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Te hemos enviado un correo de verificación. Verifica tu correo antes de cerrar esta pestaña.');
        auth.signOut();
    } catch (error) {
        manejarErroresAuth(error, "registrarse");
    }
}

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
        manejarErroresAuth(error, "iniciar sesión");
    }
}

async function registrarConGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        if (result.additionalUserInfo.isNewUser) {
            await db.collection("users").doc(user.uid).set({
                nombre: user.displayName || "",
                favoritos: [],
                creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Registro con Google exitoso.");
            window.location.href = "../HTML/index.html";
        } else {
            await auth.signOut();
            alert("Este correo ya está registrado. Inicia sesión en su lugar.");
        }
    } catch (error) {
        alert("Error al registrar con Google: " + error.message);
    }
}

async function iniciarSesionConGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await auth.signInWithPopup(provider);
        if (result.additionalUserInfo.isNewUser) {
            await auth.signOut();
            alert("Este correo no está registrado. Regístrate primero.");
        } else {
            alert("Inicio de sesión con Google exitoso.");
            guardarUsuarioActual();
            window.location.href = "../HTML/index.html";
        }
    } catch (error) {
        alert("Error al iniciar sesión con Google: " + error.message);
    }
}

async function recuperarContrasena(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Correo de recuperación enviado. Verifica tu bandeja de entrada.');
    } catch (error) {
        manejarErroresAuth(error, "recuperar la contraseña");
    }
}

async function cerrarSesion() {
    try {
        await auth.signOut();
        localStorage.removeItem("uid");
        localStorage.removeItem("email");
        localStorage.removeItem("idToken");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
    }
}

// ---------------------- INTERFAZ DOM ----------------------

document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.querySelector('.sign-up-container form');
    const signInForm = document.querySelector('.sign-in-container form');
    const recoverForm = document.getElementById('recover-form');

    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = signUpForm['nombre'].value;
            const email = signUpForm['email'].value;
            const password = signUpForm['contrasena'].value;
            const confirmPassword = signUpForm['re-contrasena'].value;
            registrarUsuario(nombre, email, password, confirmPassword);
        });
    }

    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = signInForm['email'].value;
            const password = signInForm['password'].value;
            iniciarSesion(email, password);
        });
    }

    if (recoverForm) {
        recoverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('recover-email').value;
            recuperarContrasena(email);
        });
    }

    const cerrarBtn = document.getElementById("cerrarSesion");
    if (cerrarBtn) {
        cerrarBtn.addEventListener("click", cerrarSesion);
    }
});

// ---------------------- OBSERVADOR DE SESIÓN ----------------------

auth.onAuthStateChanged((user) => {
    const cuentaContainer = document.getElementById("cuenta-container");
    const cuenta = document.getElementById("cuenta");
    const cerrarSesionBtn = document.getElementById("cerrarSesion");
    const asideButtons = document.getElementById("aside-buttons");

    if (user && user.emailVerified) {
        // Ocultar botones de login/registro
        asideButtons.querySelectorAll("a").forEach(a => a.style.display = "none");

        // Mostrar la cuenta y el botón de cerrar sesión
        cuentaContainer.style.display = "flex";
        cuenta.title = user.email;

        cerrarSesionBtn.addEventListener("click", async () => {
            await cerrarSesion();
        });
    }
});

// ---------------------- UTILIDADES ----------------------

function validarContrasena(password) {
    const errores = [];
    if (password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");
    if (!/[A-Z]/.test(password)) errores.push("Debe contener al menos una letra mayúscula.");
    if (!/[a-z]/.test(password)) errores.push("Debe contener al menos una letra minúscula.");
    if (!/[^\w\s]/.test(password)) errores.push("Debe contener al menos un carácter especial.");
    if (!/[0-9]/.test(password)) errores.push("Debe contener al menos un número.");
    return errores;
}

function manejarErroresAuth(error, contexto) {
    let mensaje = "";
    switch (error.code) {
        case "auth/email-already-in-use": mensaje = "El correo ya está en uso."; break;
        case "auth/invalid-email": mensaje = "El correo no es válido."; break;
        case "auth/weak-password": mensaje = "La contraseña es demasiado débil."; break;
        case "auth/user-not-found": mensaje = "No existe una cuenta con este correo."; break;
        case "auth/wrong-password": mensaje = "La contraseña es incorrecta."; break;
        case "auth/too-many-requests": mensaje = "Demasiados intentos fallidos. Intenta de nuevo más tarde."; break;
        case "auth/invalid-credential": mensaje = "La credencial es inválida o ha expirado."; break;
        default: mensaje = error.message; break;
    }

    if (contexto === "registrarse") {
        mostrarError("signUpError", mensaje);
    } else if (contexto === "iniciar sesión") {
        mostrarError("signInError", mensaje);
    } else if (contexto === "recuperar la contraseña") {
        mostrarError("recoverError", mensaje);
    }
}

function mostrarError(formId, mensaje) {
    const errorDiv = document.getElementById(formId);
    if (errorDiv) {
        errorDiv.textContent = mensaje;
    }
}

function guardarUsuarioActual() {
    const user = auth.currentUser;
    if (user) {
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", user.email);
        user.getIdToken().then((idToken) => {
            localStorage.setItem("idToken", idToken);
        });
    }
}

async function comprobarUsuario() {
    // Comprobar si hay un usuario logueado usando Firebase
    const currentUser = auth.currentUser;

    if (currentUser) {
        // Imprimir el email del usuario en la consola si está autenticado
        console.log("Usuario autenticado: ", currentUser.email);
        return true; // Usuario autenticado
    } else {
        console.log("No hay usuario autenticado.");
        return false; // No hay usuario autenticado
    }
}

// ---------------------- FAVORITOS ----------------------

async function añadirFavorito(uid, beachId) {
    try {
        await db.collection("users").doc(uid).update({
            favoritos: firebase.firestore.FieldValue.arrayUnion(beachId),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error(`❌ Error al añadir favorito: ${error.message}`);
    }
}

async function eliminarFavorito(uid, beachId) {
    try {
        await db.collection("users").doc(uid).update({
            favoritos: firebase.firestore.FieldValue.arrayRemove(beachId),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error(`❌ Error al eliminar favorito: ${error.message}`);
    }
}

// ---------------------- EXPORTACIONES ----------------------

window.socialSignIn = iniciarSesionConGoogle;
window.socialSignUp = registrarConGoogle;
window.recuperarContrasena = recuperarContrasena;