import os
import json
import sys
import re
import shutil
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

import process_stats

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

def get_latest_date_dir():
    latest_date = process_stats.get_latest_date(DATA_DIR)
    if not latest_date:
        return None
    return os.path.join(DATA_DIR, latest_date)

def load_meta_data():
    meta_dir = os.path.join(DATA_DIR, "meta")
    pokedex = process_stats.load_data(os.path.join(meta_dir, "pokedex.json"))
    moves = process_stats.load_data(os.path.join(meta_dir, "moves.json"))
    items = process_stats.load_data(os.path.join(meta_dir, "items.json"))
    abilities = process_stats.load_data(os.path.join(meta_dir, "abilities.json"))
    meta_names = process_stats.load_data(os.path.join(meta_dir, "meta_names.json"))
    return pokedex, moves, items, abilities, meta_names

POKEDEX, MOVES, ITEMS, ABILITIES, META_NAMES = load_meta_data()

FORMAT_DATA_CACHE = {}

def get_format_data(format_id: str, rating: int = None):
    cache_key = f"{format_id}-{rating}" if rating is not None else format_id
    if cache_key in FORMAT_DATA_CACHE:
        return FORMAT_DATA_CACHE[cache_key]
    
    date_dir = get_latest_date_dir()
    if not date_dir:
        print("Error: No date directory found")
        return None
        
    if rating is not None:
        filename = f"{format_id}-{rating}.json"
        if not os.path.exists(os.path.join(date_dir, "data", filename)):
            print(f"Rating {rating} not found for {format_id}, falling back to best")
            filename = process_stats.get_best_stats_file(date_dir, format_id)
    else:
        filename = process_stats.get_best_stats_file(date_dir, format_id)
        
    if not filename:
        print(f"Error: No stats file found for {format_id}")
        return None
        
    file_path = os.path.join(date_dir, "data", filename)
    print(f"Loading stats from {file_path}")
    usage_data = process_stats.load_data(file_path)
    
    if not usage_data:
        return None

    if "data" in usage_data and isinstance(usage_data["data"], dict):
        usage_data = usage_data["data"]
        
    if usage_data:
        FORMAT_DATA_CACHE[cache_key] = usage_data
        
    return usage_data

def get_format_meta(format_id: str, rating: int = None):
    date_dir = get_latest_date_dir()
    if not date_dir:
        return None
        
    if rating is not None:
        filename = f"{format_id}-{rating}.json"
        if not os.path.exists(os.path.join(date_dir, "data", filename)):
            filename = process_stats.get_best_stats_file(date_dir, format_id)
    else:
        filename = process_stats.get_best_stats_file(date_dir, format_id)
        
    if not filename:
        return None
        
    extracted_rating = 0
    try:
        name = os.path.splitext(filename)[0]
        parts = name.split("-")
        if parts[-1].isdigit():
            extracted_rating = int(parts[-1])
    except:
        pass
        
    return {
        "rating": extracted_rating,
        "filename": filename
    }

@app.get("/api/formats")
def get_formats():
    date_dir = get_latest_date_dir()
    if not date_dir:
        return []
    
    data_path = os.path.join(date_dir, "data")
    if not os.path.exists(data_path):
        return []

    files = os.listdir(data_path)
    formats = set()
    
    for f in files:
        if not f.endswith(".json"):
            continue
        parts = f.rsplit("-", 1)
        if len(parts) == 2:
            formats.add(parts[0])
            
    def get_sort_key(fmt_id):
        match = re.match(r'gen(\d+)', fmt_id)
        gen = int(match.group(1)) if match else 0
        return (-gen, fmt_id)

    result = []
    for fmt in sorted(list(formats), key=get_sort_key):
        display_name = META_NAMES.get(fmt, fmt) if META_NAMES else fmt
        result.append({"id": fmt, "name": display_name})
        
    return result

@app.get("/api/format/{format_id}/ratings")
def get_format_ratings(format_id: str):
    date_dir = get_latest_date_dir()
    if not date_dir:
        return []
    
    data_path = os.path.join(date_dir, "data")
    if not os.path.exists(data_path):
        return []
        
    files = [f for f in os.listdir(data_path) if f.startswith(format_id + "-") and f.endswith(".json")]
    ratings = []
    
    for f in files:
        try:
            name = os.path.splitext(f)[0]
            parts = name.split("-")
            if parts[-1].isdigit():
                ratings.append(int(parts[-1]))
        except:
            continue
            
    return sorted(ratings)

PROCESSED_CACHE = {}

@app.get("/api/format/{format_id}")
def get_format_index(format_id: str, rating: int = None):
    cache_key = f"index-{format_id}-{rating}"
    
    if cache_key in PROCESSED_CACHE:
        data = PROCESSED_CACHE[cache_key]
    else:
        data = process_format(format_id, rating)
        PROCESSED_CACHE[cache_key] = data
        
    if data:
        display_name = META_NAMES.get(format_id, format_id) if META_NAMES else format_id
        data["format"] = display_name
        
    return data

@app.get("/api/format/{format_id}/pokemon/{pokemon_name}")
def get_pokemon_stats(format_id: str, pokemon_name: str, rating: int = None):
    safe_name = pokemon_name.lower().replace(" ", "-").replace(".", "").replace(":", "").replace("'", "")
    cache_key = f"stats-{format_id}-{safe_name}-{rating}"
    
    if cache_key in PROCESSED_CACHE:
        return PROCESSED_CACHE[cache_key]
    
    usage_data = get_format_data(format_id, rating)
    if not usage_data:
        raise HTTPException(status_code=404, detail="Format not found")
        
    search_name = pokemon_name.replace("-", " ")
    
    full_stats = process_stats.collect_pokemon_stats(
        search_name, usage_data, POKEDEX, MOVES, ITEMS, ABILITIES
    )
    
    if not full_stats:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    
    meta = get_format_meta(format_id, rating)
    if meta:
        full_stats["rating"] = meta["rating"]

    PROCESSED_CACHE[cache_key] = full_stats
        
    return full_stats

def process_format(format_id: str, rating: int = None):
    print(f"Processing format index: {format_id} (rating: {rating})")
    
    usage_data = get_format_data(format_id, rating)
    if not usage_data:
        raise HTTPException(status_code=404, detail="Format data not found")
        
    pokemon_list = []
    sorted_mons = sorted(usage_data.keys(), key=lambda x: usage_data[x].get("usage", 0), reverse=True)
    
    for rank, mon_name in enumerate(sorted_mons, 1):
        usage_val = usage_data[mon_name].get("usage", 0)
        pokemon_list.append({
            "name": mon_name,
            "rank": rank,
            "usage_percent": round(usage_val * 100, 3)
        })
            
    meta = get_format_meta(format_id, rating)
    display_name = META_NAMES.get(format_id, format_id) if META_NAMES else format_id
    index_data = {
        "format": display_name,
        "rating": meta["rating"] if meta else 0,
        "pokemon": pokemon_list
    }
    
    return index_data

@app.get("/api/meta/moves")
def get_meta_moves():
    return MOVES

@app.get("/api/meta/items")
def get_meta_items():
    return ITEMS

@app.get("/api/meta/abilities")
def get_meta_abilities():
    return ABILITIES

@app.get("/api/meta/pokedex")
def get_meta_pokedex():
    return POKEDEX

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
