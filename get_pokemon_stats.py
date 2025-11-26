import os
import sys
import json
import argparse
import process_stats

def main():
    parser = argparse.ArgumentParser(description="Get stats for a specific Pokemon.")
    parser.add_argument("pokemon", nargs="?", help="Name of the Pokemon")
    parser.add_argument("--format", default="gen9ou", help="Format to use (default: gen9ou)")
    args = parser.parse_args()

    DATE = process_stats.get_latest_date()
    if not DATE:
        print("No date folder found in data directory.")
        return
        
    filename = process_stats.get_best_stats_file(os.path.join("data", DATE), args.format)
    if not filename:
        print(f"No stats file found for format '{args.format}' in {DATE}.")
        return
    STATS_FILE = os.path.join("data", DATE, "data", filename)
    META_DIR = os.path.join("data", "meta")
    
    print(f"Loading stats from {STATS_FILE}...")
    usage_data_full = process_stats.load_data(STATS_FILE)
    if not usage_data_full:
        print(f"Failed to load stats file: {STATS_FILE}")
        return

    usage_data = usage_data_full.get("data", {})
    
    pokemon_name = args.pokemon
    if not pokemon_name:
        print("No Pokemon specified. Using top Pokemon of the format...")
        pokemon_name = process_stats.get_top_pokemon(usage_data)
        if not pokemon_name:
            print("Could not determine top Pokemon.")
            return
        print(f"Top Pokemon is: {pokemon_name}")
    
    print("Loading metadata...")
    pokedex = process_stats.load_data(os.path.join(META_DIR, "pokedex.json"))
    moves = process_stats.load_data(os.path.join(META_DIR, "moves.json"))
    items = process_stats.load_data(os.path.join(META_DIR, "items.json"))
    abilities = process_stats.load_data(os.path.join(META_DIR, "abilities.json"))
    
    print(f"Collecting stats for '{pokemon_name}'...")
    stats = process_stats.collect_pokemon_stats(pokemon_name, usage_data, pokedex, moves, items, abilities)
    
    if stats:
        print(json.dumps(stats, indent=2))
    else:
        print(f"Pokemon '{pokemon_name}' not found.")

if __name__ == "__main__":
    main()
