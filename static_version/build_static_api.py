import os
import json
import shutil
import sys
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import process_stats

OUTPUT_DIR = os.path.join("frontend", "public", "api")
DATA_DIR = os.path.join("..", "data")

def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f)

def build_static_api():
    start_time = time.time()
    print("Starting static API build...")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("Loading metadata...")
    meta_dir = os.path.join(DATA_DIR, "meta")
    pokedex = process_stats.load_data(os.path.join(meta_dir, "pokedex.json"))
    moves = process_stats.load_data(os.path.join(meta_dir, "moves.json"))
    items = process_stats.load_data(os.path.join(meta_dir, "items.json"))
    abilities = process_stats.load_data(os.path.join(meta_dir, "abilities.json"))
    meta_names = process_stats.load_data(os.path.join(meta_dir, "meta_names.json"))

    print("Saving metadata endpoints...")
    save_json(os.path.join(OUTPUT_DIR, "meta", "pokedex.json"), pokedex)
    save_json(os.path.join(OUTPUT_DIR, "meta", "moves.json"), moves)
    save_json(os.path.join(OUTPUT_DIR, "meta", "items.json"), items)
    save_json(os.path.join(OUTPUT_DIR, "meta", "abilities.json"), abilities)

    latest_date = process_stats.get_latest_date(DATA_DIR)
    if not latest_date:
        print("Error: No data found.")
        return
    
    print(f"Using data from: {latest_date}")
    date_dir = os.path.join(DATA_DIR, latest_date)
    data_path = os.path.join(date_dir, "data")

    files = os.listdir(data_path)
    formats_map = {}

    for f in files:
        if not f.endswith(".json"):
            continue
        parts = f.rsplit("-", 1)
        if len(parts) != 2:
            continue
        fmt_id = parts[0]
        try:
            rating = int(parts[1].replace(".json", ""))
            if fmt_id not in formats_map:
                formats_map[fmt_id] = []
            formats_map[fmt_id].append(rating)
        except ValueError:
            continue

    formats_list = []
    def get_sort_key(fmt_id):
        import re
        match = re.match(r'gen(\d+)', fmt_id)
        gen = int(match.group(1)) if match else 0
        return (-gen, fmt_id)

    for fmt_id in sorted(formats_map.keys(), key=get_sort_key):
        display_name = meta_names.get(fmt_id, fmt_id) if meta_names else fmt_id
        formats_list.append({"id": fmt_id, "name": display_name})
    
    save_json(os.path.join(OUTPUT_DIR, "formats.json"), formats_list)

    for fmt_id, ratings in formats_map.items():
        sorted_ratings = sorted(ratings, reverse=True)
        best_rating = sorted_ratings[0]
        
        save_json(os.path.join(OUTPUT_DIR, "format", fmt_id, "ratings.json"), sorted(ratings))

        for rating in sorted_ratings:
            filename = f"{fmt_id}-{rating}.json"
            file_path = os.path.join(data_path, filename)
            
            print(f"Processing {fmt_id} (Rating: {rating})...")
            
            usage_data_full = process_stats.load_data(file_path)
            if not usage_data_full:
                continue
                
            usage_data = usage_data_full.get("data", {})
            
            pokemon_list = []
            sorted_mons = sorted(usage_data.keys(), key=lambda x: usage_data[x].get("usage", 0), reverse=True)
            
            for rank, mon_name in enumerate(sorted_mons, 1):
                usage_val = usage_data[mon_name].get("usage", 0)
                pokemon_list.append({
                    "name": mon_name,
                    "rank": rank,
                    "usage_percent": round(usage_val * 100, 3)
                })
                
                safe_name = mon_name.lower().replace(" ", "-").replace(".", "").replace(":", "").replace("'", "")
                
                specific_path = os.path.join(OUTPUT_DIR, "format", fmt_id, "pokemon", f"{safe_name}-{rating}.json")
                default_path = os.path.join(OUTPUT_DIR, "format", fmt_id, "pokemon", f"{safe_name}.json")
                
                need_specific = not os.path.exists(specific_path)
                need_default = (rating == best_rating) and not os.path.exists(default_path)
                
                if not need_specific and not need_default:
                    continue

                full_stats = process_stats.collect_pokemon_stats(
                    mon_name, usage_data, pokedex, moves, items, abilities
                )
                
                if full_stats:
                    full_stats["rating"] = rating
                    if need_specific:
                        save_json(specific_path, full_stats)
                    if need_default:
                        save_json(default_path, full_stats)

            display_name = meta_names.get(fmt_id, fmt_id) if meta_names else fmt_id
            index_data = {
                "format": display_name,
                "rating": rating,
                "pokemon": pokemon_list
            }
            
            save_json(os.path.join(OUTPUT_DIR, "format", fmt_id, f"index-{rating}.json"), index_data)
            if rating == best_rating:
                save_json(os.path.join(OUTPUT_DIR, "format", fmt_id, "index.json"), index_data)

    end_time = time.time()
    print(f"Build complete in {end_time - start_time:.2f} seconds.")

if __name__ == "__main__":
    build_static_api()
