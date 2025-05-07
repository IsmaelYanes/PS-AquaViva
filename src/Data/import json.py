import json

FULLFISH_ZONAS_PATH = "fullfish_con_zonas.json"
ZONAS_ORIGINAL_PATH = "zonas_litoral.json"
ZONAS_OUTPUT_PATH = "zonas_litoral_reconstruido.json"

# Cargar peces con zonas
with open(FULLFISH_ZONAS_PATH, encoding="utf-8") as f:
    peces = json.load(f)

# Cargar zonas base
with open(ZONAS_ORIGINAL_PATH, encoding="utf-8") as f:
    zonas = json.load(f)

# Crear diccionario para agrupar peces por zona
peces_por_zona = {}

for pez in peces:
    nombre_mostrar = pez.get("nom_commun") or pez.get("name")
    for zona in pez.get("zonas", []):
        peces_por_zona.setdefault(zona, []).append(nombre_mostrar)

# Reconstruir zonas con nuevos peces
for feature in zonas["features"]:
    zona_nombre = feature["properties"]["name"]
    lista_peces = peces_por_zona.get(zona_nombre, [])
    feature["properties"]["fish"] = sorted(lista_peces)

# Guardar nuevo archivo de zonas
with open(ZONAS_OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(zonas, f, ensure_ascii=False, indent=2)

print(f"✅ Generado {ZONAS_OUTPUT_PATH} con peces actualizados por zona.")
