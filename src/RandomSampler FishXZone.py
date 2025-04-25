import json
import random

# Read the fish and zones data
try:
    with open('./Data/fish.json', 'r', encoding='utf-8') as f:
        fish_data = json.load(f)
except FileNotFoundError:
    print("Error: fish.json not found in ./Data/")
    exit(1)

try:
    with open('./Data/zonas_litoral.json', 'r', encoding='utf-8') as f:
        zones_data = json.load(f)
except FileNotFoundError:
    print("Error: zonas_litoral.json not found in ./Data/")
    exit(1)

# Extract fish names
fish_names = [fish['name'] for fish in fish_data]

# Extract zone IDs
zone_ids = []
for idx, feature in enumerate(zones_data['features']):
    zone_id = feature.get('id', idx)  # Use index as fallback if 'id' is missing
    zone_ids.append(zone_id)

# Initialize fish assignments for each zone
zone_fish = {zone_id: [] for zone_id in zone_ids}

# Ensure each fish is assigned to at least one zone
fish_assigned = set()
for fish_name in fish_names:
    # Assign one random zone
    zone_id = random.choice(zone_ids)
    zone_fish[zone_id].append(fish_name)
    fish_assigned.add(fish_name)

# Optionally assign additional zones (0 to 2 more zones per fish)
for fish_name in fish_names:
    # Decide how many additional zones (0 to 2)
    additional_zones = random.randint(0, 2)
    # Sample additional zones, ensuring no duplicates
    available_zones = [zid for zid in zone_ids if fish_name not in zone_fish[zid]]
    if additional_zones > len(available_zones):
        additional_zones = len(available_zones)
    if additional_zones > 0:
        extra_zones = random.sample(available_zones, additional_zones)
        for zone_id in extra_zones:
            zone_fish[zone_id].append(fish_name)

# Update zones_data with fish lists
for feature in zones_data['features']:
    zone_id = feature.get('id', zones_data['features'].index(feature))
    feature['properties']['fish'] = sorted(zone_fish.get(zone_id, []))  # Sort for consistency

# Save updated zonas_litoral.json
try:
    with open('./Data/zonas_litoral.json', 'w', encoding='utf-8') as f:
        json.dump(zones_data, f, ensure_ascii=False, indent=2)
    print("Updated ./Data/zonas_litoral.json successfully with fish assignments.")
except Exception as e:
    print(f"Error writing zonas_litoral.json: {e}")