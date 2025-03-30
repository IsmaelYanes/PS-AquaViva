import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import fs from "fs/promises";
import path from "path";

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



const playasPath = path.join(process.cwd(), "../Data/beaches.json");
const imagenesPath = path.join(process.cwd(), "../Data/imagenesPlayas.json");



const cargarJSON = async (filePath) => {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
};


const subirDatos = async () => {
    try {
        const playas = await cargarJSON(playasPath);
        const imagenes = await cargarJSON(imagenesPath);

        for (let playa of playas) {
            const id = playa["ID DGE"].toString();

            // Buscar imagen correspondiente
            const imagenData = imagenes.find(img => img["ID DGE"] === playa["ID DGE"]);
            if (imagenData) {
                playa.imageURL = imagenData.imageURL;
            } else {
                playa.imageURL = "https://example.com/images/default.jpg";
            }

            await setDoc(doc(db, "playas", id), playa);
            console.log(`✅ Playa ${playa.beachName} subida con imagen`);
        }
    } catch (error) {
        console.error("❌ Error al subir datos:", error);
    }
};


subirDatos();