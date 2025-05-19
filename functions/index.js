const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Configura nodemailer con Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aquavivaps@gmail.com",          // Cambia esto por tu correo Gmail
    pass: "unkz regw ypxd eubn", // Cambia esto por tu contraseña o contraseña de app
  },
});

// Clase para enviar alertas de viento
class WeatherControl {
  constructor(user, playas) {
    this.user = user;
    this.playas = playas; // array de playas
  }

  async notifyWindAlert(currentWind, previousWind) {
    let mensaje = `
Hola ${this.user.nombre || "usuario"},

Se ha detectado un cambio brusco de viento en una o varias de tus zonas favoritas:

`;

    this.playas.forEach(playa => {
      mensaje += `📍 Playa: ${playa.nombre}
📍 Ubicación: (lat: ${playa.lat}, lon: ${playa.lon})

`;
    });

    mensaje += `🌬️ Velocidad anterior: ${previousWind} km/h
🌬️ Velocidad actual: ${currentWind} km/h

Consulta más detalles en nuestra web.

Un saludo.
    `;

    try {
      await transporter.sendMail({
        from: '"Alerta Viento" <aquavivaps@gmail.com>', // Cambia por tu correo o nombre que quieres mostrar
        to: this.user.email,
        subject: `⚠️ Alerta de viento`,
        text: mensaje,
      });

      console.log(`✅ Email enviado a ${this.user.email}`);
    } catch (error) {
      console.error(`❌ Error enviando email a ${this.user.email}:`, error);
    }
  }
}

// Función auxiliar para obtener info de la playa por ID
async function getPlayaById(id) {
  try {
    const doc = await db.collection("playas").doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();

    // Reemplaza la coma decimal por punto para convertir correctamente
    const latNum = data.LAT ? Number(data.LAT.replace(",", ".")) : NaN;
    const lonNum = data.LOG ? Number(data.LOG.replace(",", ".")) : NaN;

    return {
      id,
      nombre: data.beachName || "Playa sin nombre",
      lat: latNum,
      lon: lonNum,
    };
  } catch (err) {
    console.error("❌ Error obteniendo playa:", err);
    return null;
  }
}

// TEST MANUAL que fuerza alerta de viento a todos los usuarios
app.get("/api/test-email-alerta", async (req, res) => {
  try {
    const usuariosSnapshot = await db.collection("users").get();

    if (usuariosSnapshot.empty) {
      console.log("No hay usuarios registrados.");
      return res.status(404).json({ success: false, message: "Sin usuarios" });
    }

    for (const doc of usuariosSnapshot.docs) {
      const usuario = doc.data();
      if (!usuario.email || !Array.isArray(usuario.favoritos)) continue;

      // Array para acumular las playas válidas con sus datos numéricos
      const playasValidas = [];

      for (const playaId of usuario.favoritos) {
        const playa = await getPlayaById(playaId);

        if (!playa || isNaN(playa.lat) || isNaN(playa.lon)) {
          console.log("❌ Playa no válida o mal definida:", playaId);
          continue;
        }

        playasValidas.push(playa);
      }

      if (playasValidas.length === 0) {
        console.log(`Usuario ${usuario.email} no tiene playas válidas para alertar.`);
        continue; // No enviamos email si no hay playas válidas
      }

      const weatherControl = new WeatherControl(usuario, playasValidas);

      // Simula cambio fuerte de viento
      const previousWind = 5;
      const currentWind = 25;

      await weatherControl.notifyWindAlert(currentWind, previousWind);
    }

    res.json({ success: true, message: "Correos enviados." });
  } catch (error) {
    console.error("❌ Error en test:", error);
    res.status(500).json({ success: false, message: "Error interno." });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});