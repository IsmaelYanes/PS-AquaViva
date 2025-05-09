const firebaseConfig = {
    apiKey: "AIzaSyCU3fXaXPHYdlb8q4ZKY4iHTmXyvjjpeuQ",
    authDomain: "playascanarias-f83a8.firebaseapp.com",
    projectId: "playascanarias-f83a8",
    storageBucket: "playascanarias-f83a8.appspot.com",
    messagingSenderId: "524034321433",
    appId: "1:524034321433:web:b81e26afdf44f82aa34e88",
    measurementId: "G-W53XJWVN58"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ---------------------- FUNCIONES DE USUARIO ----------------------

async function registrarUsuario(nombre, email, password, confirmPassword) {
    const form = document.querySelector('.sign-up-container form');
    limpiarErroresFormulario(form);

    let error = false;

    if (!nombre.trim()) {
        mostrarErrorCampo('nombre', 'El nombre es obligatorio');
        error = true;
    }

    if (!email.includes('@')) {
        mostrarErrorCampo('email', 'Correo no válido');
        error = true;
    }

    if (true) {
        const erroresContrasena = [];

        if (password.length < 6) {
            erroresContrasena.push('Debe tener al menos 6 caracteres');
        }

        if (!/[A-Z]/.test(password)) {
            erroresContrasena.push('Debe tener al menos una letra mayúscula');
        }

        if (!/[a-z]/.test(password)) {
            erroresContrasena.push('Debe tener al menos una letra minúscula');
        }

        if (!/[0-9]/.test(password)) {
            erroresContrasena.push('Debe tener al menos un número');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            erroresContrasena.push('Debe tener al menos un carácter especial');
        }

        if (erroresContrasena.length > 0) {
            mostrarErrorCampo('contrasena', erroresContrasena.join('. ') + '.');
            error = true;
        }
    }

    if (password !== confirmPassword) {
        mostrarErrorCampo('re-contrasena', 'Las contraseñas no coinciden');
        error = true;
    }

    if (error) return;

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
        if (error.code === 'auth/email-already-in-use') {
            mostrarErrorCampo('email', 'Este correo ya está registrado');
        } else if (error.code === 'auth/invalid-email') {
            mostrarErrorCampo('email', 'Correo electrónico no válido');
        } else if (error.code === 'auth/weak-password') {
            mostrarErrorCampo('contrasena', 'La contraseña es demasiado débil');
        } else {
            mostrarErrorCampo('email', 'Error al crear cuenta: ' + error.message);
        }
    }
}


async function iniciarSesion(email, password) {
    const form = document.querySelector('.sign-in-container form');
    limpiarErroresFormulario(form);

    let error = false;

    if (!email.includes('@')) {
        mostrarErrorCampo('email', 'Correo no válido', true);
        error = true;
    }
    if (!password) {
        mostrarErrorCampo('password', 'Contraseña obligatoria', true);
        error = true;
    }

    if (error) return;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        if (userCredential.user.emailVerified) {
            guardarUsuarioActual();
            window.location.href = "../HTML/index.html";
        } else {
            mostrarErrorCampo('email', 'Verifica tu correo electrónico antes de iniciar sesión', true);
            await auth.signOut();
        }
    } catch (error) {
        // Personaliza errores específicos de Firebase
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            mostrarErrorCampo('email', 'Correo o contraseña incorrectos', true);
        } else if (error.code === 'auth/user-not-found') {
            mostrarErrorCampo('email', 'Este usuario no está registrado', true);
        } else if (error.code === 'auth/too-many-requests') {
            mostrarErrorCampo('email', 'Demasiados intentos. Intenta más tarde.', true);
        } else {
            mostrarErrorCampo('email', 'Error al iniciar sesión: ' + error.message, true);
        }
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

    if (user && (user.emailVerified || esProveedorGoogle(user))) {
        asideButtons.querySelectorAll("a").forEach(a => a.style.display = "none");

        cuentaContainer.style.display = "flex";
        cuenta.title = user.email;

        cerrarSesionBtn.addEventListener("click", async () => {
            await cerrarSesion();
        });
    }
});

// ---------------------- UTILIDADES ----------------------

//function validarContrasena(password) {
    //const errores = [];
    //if (password.length < 6) errores.push("La contraseña debe tener al menos 6 caracteres.");
    //if (!/[A-Z]/.test(password)) errores.push("Debe contener al menos una letra mayúscula.");
    //if (!/[a-z]/.test(password)) errores.push("Debe contener al menos una letra minúscula.");
    //if (!/[^\w\s]/.test(password)) errores.push("Debe contener al menos un carácter especial.");
    //if (!/[0-9]/.test(password)) errores.push("Debe contener al menos un número.");
    //return errores;
//}

//function manejarErroresAuth(error, contexto) {
    //let mensaje = "";
    //switch (error.code) {
        //case "auth/email-already-in-use": mensaje = "El correo ya está en uso."; break;
        //case "auth/invalid-email": mensaje = "El correo no es válido."; break;
        //case "auth/weak-password": mensaje = "La contraseña es demasiado débil."; break;
        //case "auth/user-not-found": mensaje = "No existe una cuenta con este correo."; break;
        //case "auth/wrong-password": mensaje = "La contraseña es incorrecta."; break;
        //case "auth/too-many-requests": mensaje = "Demasiados intentos fallidos. Intenta de nuevo más tarde."; break;
       // case "auth/invalid-credential": mensaje = "La credencial es inválida o ha expirado."; break;
        //default: mensaje = error.message; break;
    //}

    //if (contexto === "registrarse") {
       // mostrarError("signUpError", mensaje);
    //} else if (contexto === "iniciar sesión") {
      //  mostrarError("signInError", mensaje);
    //} else if (contexto === "recuperar la contraseña") {
        //mostrarError("recoverError", mensaje);
    //}
//}

function mostrarErrorCampo(nombreCampo, mensaje, isLogin = false) {
    const campo = document.querySelector(`[name="${nombreCampo}"]`);
    const errorKey = isLogin ? `login-${nombreCampo}` : nombreCampo;
    const errorSpan = document.querySelector(`.error-text[data-error-for="${errorKey}"]`);

    if (!campo) console.warn(`No se encontró el campo con name="${nombreCampo}"`);
    if (!errorSpan) console.warn(`No se encontró error span con data-error-for="${errorKey}"`);

    if (campo && errorSpan) {
        campo.classList.add('input-error');
        errorSpan.textContent = mensaje;
    }
}

function limpiarErroresFormulario(formulario) {
    formulario.querySelectorAll('.error-text').forEach(span => span.textContent = '');
    formulario.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
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
    const currentUser = auth.currentUser;

    if (currentUser) {
        console.log("Usuario autenticado: ", currentUser.email);
        return true; // Usuario autenticado
    } else {
        console.log("No hay usuario autenticado.");
        return false;
    }
}

function esProveedorGoogle(user) {
    return user.providerData.some(provider => provider.providerId === "google.com");
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
window.recuperarContrasena = function(email) {
    const errorDiv = document.getElementById('recoverError');
    const successDiv = document.getElementById('recoverSuccess');
    
    errorDiv.textContent = '';
    successDiv.textContent = '';

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            successDiv.textContent = 'Se ha enviado un correo para restablecer la contraseña.';
        })
        .catch((error) => {
            let mensaje = '';
            switch (error.code) {
                case 'auth/user-not-found':
                    mensaje = 'No existe una cuenta con este correo.';
                    break;
                case 'auth/invalid-email':
                    mensaje = 'El formato del correo es inválido.';
                    break;
                default:
                    mensaje = 'Ocurrió un error. Inténtelo nuevamente.';
                    console.error(error); // para depuración
            }
            errorDiv.textContent = mensaje;
        });
}