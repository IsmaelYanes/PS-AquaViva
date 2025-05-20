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
            nombre: user.displayName || "",
            email: user.email,
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

    // Solicita permiso explícito para acceder al correo
    provider.addScope('email');

    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Intenta obtener el correo directamente desde user o providerData
        const email = user.email || user.providerData[0]?.email || "";

        if (result.additionalUserInfo.isNewUser) {
            await db.collection("users").doc(user.uid).set({
                nombre: user.displayName || "",
                email: email,
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
        // Obtener UID actual antes de cerrar sesión
        const user = auth.currentUser;
        const uid = user?.uid;

        // Cerrar sesión
        await auth.signOut();

        // Limpiar datos del usuario del localStorage
        localStorage.removeItem("uid");
        localStorage.removeItem("email");
        localStorage.removeItem("idToken");
        if (uid) {
            localStorage.removeItem(`favoritos_${uid}`);
        }

        // Redirigir al inicio
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error.message);
    }
}

async function actualizarEstadoNotificaciones(uid, activar) {
    try {
        await db.collection("users").doc(uid).update({
            notificacionesActivadas: activar
        });
        // No necesitamos actualizar notificacionesActivadas aquí, ya que lo haremos en el listener
        const toggleNotificacionesBtn = document.getElementById('toggle-notificaciones');
        if (toggleNotificacionesBtn) {
            toggleNotificacionesBtn.textContent = activar ? 'Desactivar Notificaciones' : 'Activar Notificaciones';
        }
    } catch (error) {
        console.error("Error al actualizar el estado de las notificaciones:", error);
        alert("No se pudo actualizar el estado de las notificaciones.");
    }
}

// ---------------------- INTERFAZ DOM ----------------------

document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.querySelector('.sign-up-container form');
    const signInForm = document.querySelector('.sign-in-container form');
    const recoverForm = document.getElementById('recover-form');
    let cuentaBtn;
    let notificacionesDropdown;
    let toggleNotificacionesBtn;
    let notificacionesActivadas = false;

    auth.onAuthStateChanged(async (user) => {
        const cuentaContainer = document.getElementById("cuenta-container");
        const asideButtons = document.getElementById("aside-buttons");
        cuentaBtn = document.getElementById('cuenta');
        notificacionesDropdown = document.getElementById('notificaciones-dropdown');
        toggleNotificacionesBtn = document.getElementById('toggle-notificaciones');

        if (user && (user.emailVerified || esProveedorGoogle(user))) {
            asideButtons.querySelectorAll("a").forEach(a => a.style.display = "none");
            cuentaContainer.style.display = "flex";
            const bell = document.getElementById('bell');
            const dropdown = document.getElementById('notifications');

            if (bell && dropdown) {
                bell.addEventListener('click', () => {
                    dropdown.classList.toggle('active');
                });

                window.addEventListener('click', (e) => {
                    if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.remove('active');
                    }
                });
            } else {
                console.warn("🔔 Bell or notifications dropdown element not found. Notifications might not work as expected.");
            }
            if (cuentaBtn) {
                const displayEmail = user.email || user.providerData.find(provider => provider.providerId === 'google.com')?.email || "Cuenta";
                cuentaBtn.title = displayEmail;
                cuentaBtn.addEventListener('click', () => {
                    if (notificacionesDropdown) {
                        notificacionesDropdown.style.display = notificacionesDropdown.style.display === 'block' ? 'none' : 'block';
                    }
                });
            } else {
                console.error("No se encontró el botón con id 'cuenta' dentro del observador de sesión.");
            }

            const cerrarSesionBtn = document.getElementById("cerrarSesion");
            if (cerrarSesionBtn) {
                cerrarSesionBtn.addEventListener("click", async () => {
                    await cerrarSesion();
                });
            }

            if (toggleNotificacionesBtn) {
                toggleNotificacionesBtn.addEventListener('click', async () => {
                    if (user) {
                        notificacionesActivadas = !notificacionesActivadas;
                        toggleNotificacionesBtn.textContent = notificacionesActivadas ? 'Desactivar Notificaciones' : 'Activar Notificaciones';
                        await actualizarEstadoNotificaciones(user.uid, notificacionesActivadas);
                    } else {
                        alert("Debes iniciar sesión para gestionar las notificaciones.");
                        if (notificacionesDropdown) {
                            notificacionesDropdown.style.display = 'none';
                        }
                    }
                });

                const userDoc = await db.collection("users").doc(user.uid).get();
                if (userDoc.exists && userDoc.data().notificacionesActivadas !== undefined) {
                    notificacionesActivadas = userDoc.data().notificacionesActivadas;
                    toggleNotificacionesBtn.textContent = notificacionesActivadas ? 'Desactivar Notificaciones' : 'Activar Notificaciones';
                } else {
                    await db.collection("users").doc(user.uid).set({ notificacionesActivadas: false }, { merge: true });
                    notificacionesActivadas = false;
                    toggleNotificacionesBtn.textContent = 'Activar Notificaciones';
                }
            } else {
                console.error("No se encontró el botón con id 'toggle-notificaciones' dentro del observador de sesión.");
            }

        } else {
            if (cuentaContainer) {
                cuentaContainer.style.display = "none";
            }
            asideButtons.querySelectorAll("a").forEach(a => a.style.display = "inline-block");
            if (notificacionesDropdown) {
                notificacionesDropdown.style.display = 'none';
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (cuentaBtn && notificacionesDropdown && !cuentaBtn.contains(event.target) && !notificacionesDropdown.contains(event.target)) {
            notificacionesDropdown.style.display = 'none';
        }
    });

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
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Usuario autenticado:", user.email || user.providerData.find(provider => provider.providerId === 'google.com')?.email || null);
            guardarUsuarioActual();
        } else {
            console.log("No hay usuario autenticado.");
        }
    });
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

async function guardarUsuarioActual() {
    const user = auth.currentUser;
    if (user) {
        localStorage.setItem("uid", user.uid);
        const email = user.email || user.providerData.find(provider => provider.providerId === 'google.com')?.email || null;
        localStorage.setItem("email", email);
        user.getIdToken().then((idToken) => {
            localStorage.setItem("idToken", idToken);
        });
    }
}

async function comprobarUsuario() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                const email = user.email || user.providerData.find(provider => provider.providerId === 'google.com')?.email || null;
                console.log("Usuario autenticado:", email);
                resolve(true);
            } else {
                console.log("No hay usuario autenticado.");
                resolve(false);
            }
        });
    });
}

function esProveedorGoogle(user) {
    return user.providerData.some(provider => provider.providerId === "google.com");
}

// ---------------------- FAVORITOS ----------------------

async function addFavourite(uid, beachId) {
    if (!uid || !beachId) {
        console.warn("⚠️ UID o BeachID inválido.");
        return;
    }

    try {
        await db.collection("users").doc(uid).update({
            favoritos: firebase.firestore.FieldValue.arrayUnion(beachId),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 🔄 Actualizar el cache local
        await downloadFavourite(uid, true);
    } catch (error) {
        console.error(`❌ Error al añadir favorito: ${error.message}`);
    }
}

async function removeFavourite(uid, beachId) {
    if (!uid || !beachId) {
        console.warn("⚠️ UID o BeachID inválido.");
        return;
    }

    try {
        await db.collection("users").doc(uid).update({
            favoritos: firebase.firestore.FieldValue.arrayRemove(beachId),
            lastUpdatedFav: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 🔄 Actualizar el cache local
        await downloadFavourite(uid, true);
    } catch (error) {
        console.error(`❌ Error al eliminar favorito: ${error.message}`);
    }
}

async function downloadFavourite(uid) {
    const localKey = `favoritos_${uid}`;

    // ✅ Comprobamos si ya existen en localStorage
    const yaCargados = localStorage.getItem(localKey);
    if (yaCargados) {
        console.log("📦 Favoritos ya cargados en localStorage. No se actualiza desde Firestore.");
        return;
    }

    try {
        const userDoc = await db.collection("users").doc(uid).get();

        if (!userDoc.exists) {
            console.warn("⚠️ El usuario no existe.");
            return;
        }

        const userData = userDoc.data();
        const favoritos = userData.favoritos || [];

        localStorage.setItem(localKey, JSON.stringify(favoritos));
        console.log(`✅ Favoritos cargados en localStorage: ${favoritos.length} elementos.`);
    } catch (error) {
        console.error(`❌ Error al cargar favoritos: ${error.message}`);
    }
}

//----------------------- COMENTARIOS ------------------------

async function addComment(beachId, commentData) {
    try {
        const { text, owner, fish, uid } = commentData;

        if (!beachId || !text || !owner || !uid) {
            throw new Error("beachId, comentarioTexto, ownerEmail y uid son obligatorios");
        }

        const comentariosRef = db.collection("forums").doc(beachId).collection("comments");

        // Añadir comentario
        await comentariosRef.add({
            text: text,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            owner: owner,
            fish: fish || []
        });

        // Asegurar que el documento de la playa existe y añadir el UID como único lector
        const beachDocRef = db.collection("forums").doc(beachId);
        await beachDocRef.set({
            readers: [uid]
        }, { merge: true });

        console.log(`✅ Comentario añadido y lectores actualizados para la playa ${beachId}`);
    } catch (error) {
        console.error(`❌ Error al añadir comentario: ${error.message}`);
    }
}

async function loadComments(beachId, currentUserUid) {
    if (!beachId || !currentUserUid) {
        throw new Error("beachId y currentUserUid son obligatorios");
    }

    const beachDocRef = db.collection("forums").doc(beachId);
    const commentsRef = beachDocRef.collection("comments");

    try {
        // 1. Obtener comentarios ordenados por fecha
        const commentsSnapshot = await commentsRef.orderBy("date", "asc").get();

        // Transformar snapshot a array de comentarios
        const comments = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // 2. Leer el documento de la playa para obtener el array de readers
        const beachDoc = await beachDocRef.get();

        let readers = [];
        if (beachDoc.exists) {
            readers = beachDoc.data().readers || [];
        }

        // 3. Añadir UID a readers si no está
        if (!readers.includes(currentUserUid)) {
            readers.push(currentUserUid);
            await beachDocRef.set({ readers }, { merge: true });
            console.log(`UID ${currentUserUid} añadido a readers de la playa ${beachId}`);
        }

        return comments;

    } catch (error) {
        console.error("Error cargando comentarios y actualizando readers:", error);
        throw error;
    }
}

async function deleteCommentById(beachId, commentId) {
    if (!beachId || !commentId) {
        console.warn("No se proporcionó un ID de playa o comentario para eliminar.");
        return;
    }

    try {
        await db
            .collection("forums")
            .doc(beachId)
            .collection("comments")
            .doc(commentId)
            .delete();

        console.log(`✅ Comentario ${commentId} eliminado de forum ${beachId}`);
    } catch (error) {
        console.error("Error eliminando comentario:", error);
    }
}

async function hasUnreadComments(beachId) {
    const userUid = localStorage.getItem("uid");
    if (!userUid || !beachId) {
        console.warn("Falta el UID o el ID de la playa.");
        return false;
    }

    try {
        const commentsRef = collection(db, "beaches", beachId, "comments");
        const snapshot = await getDocs(commentsRef);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const readers = data.readers || [];

            if (!readers.includes(userUid)) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error verificando comentarios no leídos:", error);
        return false;
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