import os
import json
import process_stats
import time
import re

DATE = process_stats.get_latest_date()
if not DATE:
    print("No date folder found in data directory.")
    exit(1)
    
print(f"Using latest date: {DATE}")
DATA_DIR = os.path.join("data", DATE, "data")
META_DIR = os.path.join("data", "meta")
OUTPUT_FILE = os.path.join("data", DATE, "global_stats.json")

def get_best_files(data_dir):
    files = os.listdir(data_dir)
    pattern = re.compile(r"^(.*)-(\d+)\.json$")
    
    formats = {}
    
    for filename in files:
        match = pattern.match(filename)
        if not match:
            continue
            
        fmt = match.group(1)
        elo = int(match.group(2))
        full_path = os.path.join(data_dir, filename)
        
        if fmt not in formats:
            formats[fmt] = { "elo": elo, "file": full_path }
        else:
            if elo > formats[fmt]["elo"]:
                formats[fmt] = { "elo": elo, "file": full_path }
                
    return { k: v["file"] for k, v in formats.items() }

def build_global_stats():
    print(f"Scanning for stats files in {DATA_DIR}...")
    best_files = get_best_files(DATA_DIR)
    
    if not best_files:
        print("No valid stats files found.")
        return

    print(f"Found {len(best_files)} unique formats (using top Elo for each).")
    
    print("Loading metadata...")
    pokedex = process_stats.load_data(os.path.join(META_DIR, "pokedex.json"))
    moves = process_stats.load_data(os.path.join(META_DIR, "moves.json"))
    items = process_stats.load_data(os.path.join(META_DIR, "items.json"))
    abilities = process_stats.load_data(os.path.join(META_DIR, "abilities.json"))
    
    global_stats = {}
    
    start_time = time.time()
    
    for fmt, file_path in best_files.items():
        print(f"Processing format: {fmt} (from {os.path.basename(file_path)})...")
        
        usage_data_full = process_stats.load_data(file_path)
        if not usage_data_full:
            print(f"  Skipping {fmt} (failed to load).")
            continue

        usage_data = usage_data_full.get("data", {})
        format_stats = {}
        
        sorted_pokemon = sorted(usage_data.keys(), key=lambda name: usage_data[name].get("usage", 0), reverse=True)
        
        for pokemon_name in sorted_pokemon:
            stats = process_stats.collect_pokemon_stats(
                pokemon_name, usage_data, pokedex, moves, items, abilities
            )
            
            if stats:
                format_stats[pokemon_name] = stats
        
        global_stats[fmt] = format_stats
        print(f"  Processed {len(format_stats)} Pokemon for {fmt}.")
        
    end_time = time.time()
    print(f"Total processing time: {end_time - start_time:.2f} seconds.")
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    print(f"Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(global_stats, f, indent=2)
        
    print("Global stats build complete.")

if __name__ == "__main__":
    build_global_stats()
