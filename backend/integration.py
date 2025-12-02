import os
import json
import sys
import time
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add parent directory to path to import process_data
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import process_data

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# Supabase setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_meta_data():
    meta_dir = os.path.join(DATA_DIR, "meta")
    pokedex = process_data.load_data(os.path.join(meta_dir, "pokedex.json"))
    moves = process_data.load_data(os.path.join(meta_dir, "moves.json"))
    items = process_data.load_data(os.path.join(meta_dir, "items.json"))
    abilities = process_data.load_data(os.path.join(meta_dir, "abilities.json"))
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

def setup_database():
    print("Setting up database schema...")
    schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
    
    if not os.path.exists(schema_path):
        print(f"Error: Schema file not found at {schema_path}")
        return

    with open(schema_path, "r") as f:
        sql = f.read()
        
    # Split by statement to execute one by one (Supabase client might not handle multi-statement strings well depending on the backend)
    # But usually pg drivers handle it or we can try executing the whole block.
    # The supabase-py client's rpc or direct sql execution capability is limited. 
    # Standard supabase-py doesn't have a direct 'query' method exposed easily for raw SQL unless using postgres-py or similar.
    # However, for this task, we will assume the user might run this SQL manually or we use a workaround if available.
    # Wait, the user asked for the output to run. So maybe we just print it? 
    # The prompt said "update the supabase table schema and integration code and give me the output to run".
    # I will implement the function to TRY to run it if possible, or at least print instructions.
    # Actually, supabase-js has .rpc(), but running raw SQL usually requires a stored procedure or direct connection.
    # Let's just print the SQL content for now if we can't execute it, OR try to use a postgres client if we had one.
    # Given the constraints, I will read the file and print it for the user to run in the Supabase SQL Editor, 
    # AND optionally try to run it if there's a way. 
    # But for now, let's just make sure the code structure is there.
    
    print(f"SQL Schema loaded from {schema_path}")
    print("Please run the following SQL in your Supabase SQL Editor:")
    print("-" * 50)
    print(sql)
    print("-" * 50)

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--setup":
        setup_database()
        return

    print("Starting data upload to Supabase...")
    
    latest_date = process_data.get_latest_date(DATA_DIR)
    if not latest_date:
        print("No data found.")
        return
        
    print(f"Using data from: {latest_date}")
    date_dir = os.path.join(DATA_DIR, latest_date)
    
    pokedex, moves, items, abilities = load_meta_data()
    
    # Upload Metadata
    print("Uploading metadata...")
    
    # Moves
    moves_batch = []
    for move_id, move_data in moves.items():
        # Sanitize base_power
        bp = move_data.get("basePower", 0)
        if not isinstance(bp, (int, float)):
            bp = 0
            
        # Sanitize accuracy
        acc = move_data.get("accuracy")
        if acc is True:
            acc = None # Treat 'True' (always hits) as NULL
        elif not isinstance(acc, (int, float)):
            acc = None
            
        moves_batch.append({
            "id": move_id,
            "name": move_data.get("name"),
            "type": move_data.get("type"),
            "category": move_data.get("category"),
            "base_power": int(bp),
            "accuracy": int(acc) if acc is not None else None,
            "description": move_data.get("desc")
        })
        if len(moves_batch) >= 100:
            supabase.table("moves").upsert(moves_batch).execute()
            moves_batch = []
    if moves_batch:
        supabase.table("moves").upsert(moves_batch).execute()
        
    # Items
    items_batch = []
    for item_id, item_data in items.items():
        items_batch.append({
            "id": item_id,
            "name": item_data.get("name"),
            "description": item_data.get("desc"),
            "spritenum": item_data.get("spritenum")
        })
        if len(items_batch) >= 100:
            supabase.table("items").upsert(items_batch).execute()
            items_batch = []
    if items_batch:
        supabase.table("items").upsert(items_batch).execute()
        
    # Abilities
    abilities_batch = []
    for ability_id, ability_data in abilities.items():
        abilities_batch.append({
            "id": ability_id,
            "name": ability_data.get("name"),
            "description": ability_data.get("desc")
        })
        if len(abilities_batch) >= 100:
            supabase.table("abilities").upsert(abilities_batch).execute()
            abilities_batch = []
    if abilities_batch:
        supabase.table("abilities").upsert(abilities_batch).execute()
        
    # Pokedex
    pokedex_batch = []
    for mon_name, mon_data in pokedex.items():
        pokedex_batch.append({
            "name": mon_name,
            "types": mon_data.get("types"),
            "base_stats": mon_data.get("baseStats"),
            "abilities": mon_data.get("abilities")
        })
        if len(pokedex_batch) >= 100:
            supabase.table("pokedex").upsert(pokedex_batch).execute()
            pokedex_batch = []
    if pokedex_batch:
        supabase.table("pokedex").upsert(pokedex_batch).execute()

    formats_map = get_formats(date_dir)
    
    # Clear existing data? Or maybe just upsert.
    # For now, we'll assume upsert.
    
    for fmt, ratings in formats_map.items():
        # Try to get total battles from the '0' rating file
        total_battles = 0
        if 0 in ratings:
            base_file = os.path.join(date_dir, "data", f"{fmt}-0.json")
            try:
                # We use process_data.load_data which handles errors
                base_data = process_data.load_data(base_file)
                if base_data and "info" in base_data:
                    total_battles = base_data["info"].get("number of battles", 0)
            except Exception as e:
                print(f"Error reading battle count for {fmt}: {e}")

        # Insert format
        print(f"Upserting format: {fmt} (Battles: {total_battles})")
        supabase.table("formats").upsert({
            "id": fmt,
            "name": fmt, # You might want a prettier name map later
            "generation": 9, # Defaulting to 9 for now, logic can be improved
            "total_battles": total_battles
        }).execute()

        for rating in ratings:
            filename = f"{fmt}-{rating}.json"
            file_path = os.path.join(date_dir, "data", filename)
            
            print(f"Processing {fmt} (Rating: {rating})...")
            
            usage_data_full = process_data.load_data(file_path)
            if not usage_data_full:
                print(f"  Failed to load {filename}")
                continue
                
            usage_data = usage_data_full.get("data", {})
            sorted_mons = sorted(usage_data.keys(), key=lambda x: usage_data[x].get("usage", 0), reverse=True)
            
            batch_size = 50
            batch = []
            
            for rank, mon_name in enumerate(sorted_mons, 1):
                usage_val = usage_data[mon_name].get("usage", 0)
                full_stats = process_data.collect_pokemon_stats(
                    mon_name, usage_data, pokedex, moves, items, abilities
                )
                
                if not full_stats:
                    continue

                safe_name = mon_name.lower().replace(" ", "-").replace(".", "").replace(":", "").replace("'", "")

                # Prepare record
                record = {
                    "format_id": fmt,
                    "pokemon_name": mon_name,
                    "slug": safe_name,
                    "rating": rating,
                    "usage_percent": round(usage_val * 100, 3),
                    "rank": rank,
                    "data": full_stats
                }
                batch.append(record)
                
                if len(batch) >= batch_size:
                    print(f"  Uploading batch of {len(batch)} pokemon...")
                    supabase.table("pokemon_stats").upsert(batch, on_conflict="format_id,pokemon_name,rating").execute()
                    batch = []
                    
            if batch:
                print(f"  Uploading final batch of {len(batch)} pokemon...")
                supabase.table("pokemon_stats").upsert(batch, on_conflict="format_id,pokemon_name,rating").execute()
            
    print("Data upload complete.")

if __name__ == "__main__":
    main()
