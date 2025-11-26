import os
import json
import sys
import re
import shutil

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import process_stats

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "public", "data")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

def load_meta_data():
    meta_dir = os.path.join(DATA_DIR, "meta")
    pokedex = process_stats.load_data(os.path.join(meta_dir, "pokedex.json"))
    moves = process_stats.load_data(os.path.join(meta_dir, "moves.json"))
    items = process_stats.load_data(os.path.join(meta_dir, "items.json"))
    abilities = process_stats.load_data(os.path.join(meta_dir, "abilities.json"))
    return pokedex, moves, items, abilities

def get_formats(date_dir):
    data_path = os.path.join(date_dir, "data")
    files = os.listdir(data_path)
    formats = {}
    
    for f in files:
        if not f.endswith(".json"):
            continue
            
        parts = f.rsplit("-", 1)
        if len(parts) != 2:
            continue
            
        fmt_name = parts[0]
        rating_str = parts[1].replace(".json", "")
        
        try:
            rating = int(rating_str)
        except ValueError:
            continue
            
        if fmt_name not in formats:
            formats[fmt_name] = []
        formats[fmt_name].append(rating)
        
    return formats

def main():
    print("Starting data build for frontend...")
    
    latest_date = process_stats.get_latest_date(DATA_DIR)
    if not latest_date:
        print("No data found.")
        return
        
    print(f"Using data from: {latest_date}")
    date_dir = os.path.join(DATA_DIR, latest_date)
    
    pokedex, moves, items, abilities = load_meta_data()
    
    formats_map = get_formats(date_dir)
    
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    
    formats_list = []
    
    for fmt, ratings in formats_map.items():
        best_rating = max(ratings)
        filename = f"{fmt}-{best_rating}.json"
        file_path = os.path.join(date_dir, "data", filename)
        
        print(f"Processing {fmt} (Rating: {best_rating})...")
        
        usage_data_full = process_stats.load_data(file_path)
        if not usage_data_full:
            print(f"  Failed to load {filename}")
            continue
            
        usage_data = usage_data_full.get("data", {})
        
        fmt_dir = os.path.join(OUTPUT_DIR, fmt)
        os.makedirs(fmt_dir, exist_ok=True)
        
        pokemon_list = []
        
        sorted_mons = sorted(usage_data.keys(), key=lambda x: usage_data[x].get("usage", 0), reverse=True)
        
        for rank, mon_name in enumerate(sorted_mons, 1):
            usage_val = usage_data[mon_name].get("usage", 0)
            pokemon_list.append({
                "name": mon_name,
                "rank": rank,
                "usage_percent": round(usage_val * 100, 3)
            })
            
            full_stats = process_stats.collect_pokemon_stats(
                mon_name, usage_data, pokedex, moves, items, abilities
            )
            
            safe_name = mon_name.lower().replace(" ", "-").replace(".", "").replace(":", "").replace("'", "")
            with open(os.path.join(fmt_dir, f"{safe_name}.json"), 'w', encoding='utf-8') as f:
                json.dump(full_stats, f)
                
        with open(os.path.join(fmt_dir, "index.json"), 'w', encoding='utf-8') as f:
            json.dump({
                "format": fmt,
                "rating": best_rating,
                "pokemon": pokemon_list
            }, f)
            
        formats_list.append(fmt)
        
    formats_list.sort()
    with open(os.path.join(OUTPUT_DIR, "formats.json"), 'w', encoding='utf-8') as f:
        json.dump(formats_list, f)
        
    print("Data build complete.")

if __name__ == "__main__":
    main()
