import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCU3fXaXPHYdlb8q4ZKY4iHTmXyvjjpeuQ",
    authDomain: "playascanarias-f83a8.firebaseapp.com",
    projectId: "playascanarias-f83a8",
    storageBucket: "playascanarias-f83a8.firebasestorage.app",
    messagingSenderId: "524034321433",
    appId: "1:524034321433:web:b81e26afdf44f82aa34e88",
    measurementId: "G-W53XJWVN58"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const obtenerPlayas = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "playas"));
        const playas = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            playas.push({
                beachName: data.beachName,
                LAT: data.LAT,
                LOG: data.LOG,
                Composición: data.Composición,
                type: data.type,
                classification: data.classification,
                condicionesAcceso: data["Condiciones de acceso"] || "No especificado"
            });
        });

        console.log(playas); // Mostrar en consola
        return playas;
    } catch (error) {
        console.error("❌ Error al obtener los datos:", error);
    }
};

// Llamar a la función
obtenerPlayas();
