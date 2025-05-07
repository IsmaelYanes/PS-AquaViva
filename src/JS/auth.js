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

// Función para recuperar la contraseña
async function recuperarContrasena(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Correo de recuperación enviado');
    } catch (error) {
        alert('Error al enviar el correo: ' + error.message);
    }
}

// Asignar manejadores de eventos
document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.querySelector('.sign-up-container form');
    const signInForm = document.querySelector('.sign-in-container form');

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
});

window.socialSignIn = iniciarSesionConGoogle;
window.socialSignUp = registrarConGoogle;

function guardarUsuarioActual() {
    const user = auth.currentUser;

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

async function cerrarSesion() {
    try {
        // Cerrar sesión en Firebase
        await auth.signOut();

        // Eliminar el UID, email y idToken del localStorage
        localStorage.removeItem("uid");
        localStorage.removeItem("email");
        localStorage.removeItem("idToken");

        console.log("✅ Sesión cerrada y datos eliminados de localStorage.");

        // Redirigir a la página de inicio o login después de cerrar sesión
        window.location.href = "index.html";
    } catch (error) {
        console.error("⚠️ Error al cerrar sesión:", error.message);
    }
}

// Añadir una playa a favoritos
async function añadirFavorito(uid, beachId) {
    try {
        await db.collection("users").doc(uid).update({
            favoritos: firebase.firestore.FieldValue.arrayUnion(beachId),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Playa ${beachId} añadida a favoritos del usuario ${uid}`);
    } catch (error) {
        console.error(`❌ Error al añadir favorito: ${error.message}`);
    }
}

// Eliminar una playa de favoritos
async function eliminarFavorito(uid, beachId) {
    try {
        await db.collection("users").doc(uid).update({
            favoritos: firebase.firestore.FieldValue.arrayRemove(beachId),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`🗑️ Playa ${beachId} eliminada de favoritos del usuario ${uid}`);
    } catch (error) {
        console.error(`❌ Error al eliminar favorito: ${error.message}`);
    }
}





