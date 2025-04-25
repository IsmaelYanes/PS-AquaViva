import fs from "fs/promises";
import path from "path";

const archivoJSON = path.join(process.cwd(), "../Data/imagenesPlayas.json");

const actualizarRutasLocales = async () => {
    try {
        const contenido = await fs.readFile(archivoJSON, "utf-8");
        const playas = JSON.parse(contenido);

        const actualizado = playas.map((playa) => ({
            ...playa,
            imageURL: `../Images/playas/${playa["ID DGE"]}.jpg`
        }));

        await fs.writeFile(archivoJSON, JSON.stringify(actualizado, null, 2), "utf-8");
        console.log("✅ Archivo actualizado: imageURL ahora contiene la ruta local.");
    } catch (err) {
        console.error("❌ Error al procesar el archivo:", err.message);
    }
};

actualizarRutasLocales();
