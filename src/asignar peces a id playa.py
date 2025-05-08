import json
import random

# Cargar datos de playas y peces con codificación UTF-8
with open('./Data/beaches.json', 'r', encoding='utf-8') as f:
    beaches = json.load(f)

with open('./Data/fullfish.json', 'r', encoding='utf-8') as f:
    fish = json.load(f)

# Crear el mapeo de ID de playas con peces asignados aleatoriamente (entre 3 y 7)
beach_fish_mapping = []

for beach in beaches:
    beach_id = beach['ID DGE']
    beach_name = beach['beachName']

    # Asegurar entre 3 y 7 peces por playa
    num_fish = random.randint(3, 7)
    selected_fish = random.sample(fish, k=min(num_fish, len(fish)))

    # Extraer solo los nombres de los peces
    fish_list = [f['name'] for f in selected_fish]

    mapping_entry = {
        "beach_id": beach_id,
        "beach_name": beach_name,
        "fish": fish_list
    }

    beach_fish_mapping.append(mapping_entry)

# Guardar el resultado como JSON
output = {
    "beach_fish_mapping": beach_fish_mapping
}

with open('beach_fish_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=4, ensure_ascii=False)

print("Archivo 'beach_fish_mapping.json' generado correctamente.")
