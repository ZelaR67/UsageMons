import os
import json
import sys
import re
from . import process_data

DATE = process_data.get_latest_date()
if not DATE:
    print("No date folder found in data directory.")
    exit(1)
    
DATA_DIR = os.path.join("data", DATE, "data")
META_DIR = os.path.join("data", "meta")

def find_stats_file(format_name):
    if not os.path.exists(DATA_DIR):
        print(f"Data directory {DATA_DIR} does not exist.")
        return None

    files = os.listdir(DATA_DIR)
    pattern = re.compile(r"^(.*)-(\d+)\.json$")
    
    best_file = None
    max_elo = -1
    
    if format_name.endswith(".json") and os.path.exists(os.path.join(DATA_DIR, format_name)):
        return os.path.join(DATA_DIR, format_name)

    for filename in files:
        match = pattern.match(filename)
        if not match:
            continue
            
        fmt = match.group(1)
        elo = int(match.group(2))
        
        if fmt == format_name:
            if elo > max_elo:
                max_elo = elo
                best_file = filename
                
    if best_file:
        return os.path.join(DATA_DIR, best_file)
    return None

def test_extraction(format_name="gen9ou"):
    stats_file_path = find_stats_file(format_name)
    
    if not stats_file_path:
        print(f"Could not find stats file for format: {format_name}")
        return

    print(f"Loading stats from {stats_file_path}...")
    usage_data_full = process_data.load_data(stats_file_path)
    if not usage_data_full:
        print("Failed to load stats file.")
        return
        
    usage_data = usage_data_full.get("data", {})
    
    print("Loading metadata...")
    pokedex = process_data.load_data(os.path.join(META_DIR, "pokedex.json"))
    moves = process_data.load_data(os.path.join(META_DIR, "moves.json"))
    items = process_data.load_data(os.path.join(META_DIR, "items.json"))
    abilities = process_data.load_data(os.path.join(META_DIR, "abilities.json"))
    
    print("Finding top used Pokemon...")
    sorted_pokemon = sorted(usage_data.keys(), key=lambda name: usage_data[name].get("usage", 0), reverse=True)
    
    if not sorted_pokemon:
        print("No pokemon found in stats.")
        return
        
    top_pokemon = sorted_pokemon[0]
    print(f"Top Pokemon: {top_pokemon}")
    
    print("\n--- Usage Stats ---")
    print(json.dumps(process_data.extract_usage_stats(usage_data, top_pokemon), indent=2))
    
    print("\n--- Base Stats ---")
    print(process_data.extract_base_stats(top_pokemon, pokedex))
    
    print("\n--- Types ---")
    print(process_data.extract_types(top_pokemon, pokedex))
    
    print("\n--- Top 5 Moves ---")
    moves_data = process_data.extract_moves(usage_data, top_pokemon, moves)
    print(json.dumps(moves_data[:5], indent=2))
    
    print("\n--- Top 5 Teammates ---")
    teammates_data = process_data.extract_teammates(usage_data, top_pokemon)
    print(json.dumps(teammates_data[:5], indent=2))
    
    print("\n--- Top 5 Items ---")
    items_data = process_data.extract_items(usage_data, top_pokemon, items)
    print(json.dumps(items_data[:5], indent=2))
    
    print("\n--- Top 5 Abilities ---")
    abilities_data = process_data.extract_abilities(usage_data, top_pokemon, abilities)
    print(json.dumps(abilities_data[:5], indent=2))
    
    print("\n--- Top 5 Natures ---")
    natures_data = process_data.extract_natures(usage_data, top_pokemon)
    print(json.dumps(natures_data[:5], indent=2))
    
    print("\n--- Top 5 Spreads ---")
    spreads_data = process_data.extract_spreads(usage_data, top_pokemon)
    print(json.dumps(spreads_data[:5], indent=2))
    
    print("\n--- EVs Summary (Top 1 per category) ---")
    evs_data = process_data.extract_evs(usage_data, top_pokemon)
    summary_evs = {k: v[:1] for k, v in evs_data.items()}
    print(json.dumps(summary_evs, indent=2))
    
    print("\n--- Top 5 Tera Types ---")
    tera_data = process_data.extract_tera_types(usage_data, top_pokemon)
    print(json.dumps(tera_data[:5], indent=2))
    
    print("\n--- Top 5 Checks and Counters ---")
    counters_data = process_data.extract_checks_and_counters(usage_data, top_pokemon)
    print(json.dumps(counters_data[:5], indent=2))

if __name__ == "__main__":
    target_format = "gen9ou"
    if len(sys.argv) > 1:
        target_format = sys.argv[1]
    test_extraction(target_format)
