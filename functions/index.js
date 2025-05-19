const admin = require("firebase-admin");
const { Resend } = require("resend");
const fetch = require("node-fetch");
const cron = require("node-cron");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const resend = new Resend("re_FbziYn8T_9ESHMji841ses2s8vFD4hxBM");
const WEATHER_API_KEY = "8b85f367751d4882aab231335250305";

class WeatherControl {
  constructor(user, favorito) {
    this.user = user;
    this.favorito = favorito;
    this.temperature = 0;
    this.windSpeed = 0;
    this.precipitation = 0;

    this.TEMPERATURE_UMBRAL = 2;
    this.WINDSPEED_UMBRAL = 15;
    this.PRECIPITATION_UMBRAL = 5;
  }

  async loadWeather() {
    const { lat, lon } = this.favorito;
    const response = await fetch(
        `https://api.weatherapi.com/v1/marine.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`
    );
    const data = await response.json();
    const current = data.current;

    await this.updateTemperature(current.temp_c);
    await this.updateWindSpeed(current.wind_kph);
    await this.updatePrecipitation(current.precip_mm);
  }

  async notifyAlert(type, currentValue, previousValue) {
    const mensaje = `
Hola ${this.user.nombre},

Se ha detectado un cambio brusco en una de tus zonas favoritas:

- Ubicación: (lat: ${this.favorito.lat}, lon: ${this.favorito.lon})
- Parámetro afectado: ${type}

- Valor anterior: ${previousValue}
- Valor actual: ${currentValue}

Consulta más detalles en nuestra web.

Un saludo.
`;

    try {
      await resend.emails.send({
        from: "alertas@tuweb.com",
        to: this.user.email,
        subject: `⚠️ Alerta: Cambio brusco en ${type}`,
        text: mensaje,
      });

      console.log(`✅ Email enviado a ${this.user.email} (cambio en ${type})`);
    } catch (error) {
      console.error(`❌ Error enviando email a ${this.user.email}:`, error);
    }
  }

  async updateTemperature(temperature) {
    if (
        this.temperature !== 0 &&
        Math.abs(temperature - this.temperature) > this.TEMPERATURE_UMBRAL
    ) {
      await this.notifyAlert("Temperatura", temperature, this.temperature);
    }
    this.temperature = temperature;
  }

  async updatePrecipitation(precipitation) {
    if (
        this.precipitation !== 0 &&
        precipitation - this.precipitation > this.PRECIPITATION_UMBRAL
    ) {
      await this.notifyAlert("Precipitación", precipitation, this.precipitation);
    }
    this.precipitation = precipitation;
  }

  async updateWindSpeed(windSpeed) {
    if (
        this.windSpeed !== 0 &&
        windSpeed - this.windSpeed > this.WINDSPEED_UMBRAL
    ) {
      await this.notifyAlert("Viento", windSpeed, this.windSpeed);
    }
    this.windSpeed = windSpeed;
  }
}

async function main() {
  console.log("⏰ Verificando usuarios con alertas activas...");
  const usuariosSnapshot = await db
      .collection("usuarios")
      .where("notificacionesActivadas", "==", true)
      .get();

  if (usuariosSnapshot.empty) {
    console.log("No hay usuarios con alertas activas.");
    return;
  }

  for (const doc of usuariosSnapshot.docs) {
    const usuario = doc.data();
    if (!usuario.email || !Array.isArray(usuario.favoritos)) continue;

    for (const favorito of usuario.favoritos) {
      if (
          typeof favorito.lat !== "number" ||
          typeof favorito.lon !== "number"
      ) {
        console.log("Favorito mal definido:", favorito);
        continue;
      }

      const weatherControl = new WeatherControl(usuario, favorito);
      await weatherControl.loadWeather();
    }
  }

  console.log("✅ Verificación completada.");
}

// Ejecutar cada hora localmente con cron
cron.schedule("0 * * * *", () => {
  main().catch(console.error);
});
