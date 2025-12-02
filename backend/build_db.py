import sqlite3
import json
import os
import glob
import re
from process_data import collect_pokemon_stats, create_lookup_map

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, 'frontend', 'public')
DB_DIR = os.path.join(PUBLIC_DIR, 'dbs')
INDEX_DB_PATH = os.path.join(PUBLIC_DIR, 'db.png')
DATA_DIR = os.path.join(BASE_DIR, 'data', '2025-10', 'data')
META_DIR = os.path.join(BASE_DIR, 'data', 'meta')

def init_index_db(conn):
    cursor = conn.cursor()
    
    # Formats Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS formats (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        generation INTEGER NOT NULL,
        total_battles INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Global Rankings Table (for Leaderboard)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS rankings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        format_id TEXT NOT NULL,
        pokemon_name TEXT NOT NULL,
        slug TEXT NOT NULL,
        rating INTEGER NOT NULL,
        usage_percent REAL NOT NULL,
        rank INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(format_id, pokemon_name, rating),
        FOREIGN KEY(format_id) REFERENCES formats(id)
    )
    ''')
    
    # Create index for faster lookups
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_rankings_format_rating ON rankings(format_id, rating)')

    # Meta Tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS moves (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT,
        category TEXT,
        base_power INTEGER,
        accuracy INTEGER,
        description TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        spritenum INTEGER
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS abilities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pokedex (
        name TEXT PRIMARY KEY,
        types TEXT,
        base_stats TEXT,
        abilities TEXT
    )
    ''')
    
    conn.commit()

def init_format_db(conn):
    cursor = conn.cursor()
    # Pokemon Details Table - specific to this format
    # Only stores the heavy JSON data
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pokemon_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pokemon_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pokemon_name, rating)
    )
    ''')
    conn.commit()

def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {path}: {e}")
        return {}

def populate_meta(conn):
    print("Populating metadata...")
    cursor = conn.cursor()
    
    # Pokedex
    pokedex = load_json(os.path.join(META_DIR, 'pokedex.json'))
    for name, data in pokedex.items():
        cursor.execute('''
        INSERT OR REPLACE INTO pokedex (name, types, base_stats, abilities)
        VALUES (?, ?, ?, ?)
        ''', (
            name,
            json.dumps(data.get('types', [])),
            json.dumps(data.get('baseStats', {})),
            json.dumps(data.get('abilities', {}))
        ))

    # Moves
    moves = load_json(os.path.join(META_DIR, 'moves.json'))
    for id, data in moves.items():
        cursor.execute('''
        INSERT OR REPLACE INTO moves (id, name, type, category, base_power, accuracy, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            id,
            data.get('name', ''),
            data.get('type', ''),
            data.get('category', ''),
            data.get('basePower', 0),
            data.get('accuracy', 100),
            data.get('desc', data.get('shortDesc', ''))
        ))

    # Items
    items = load_json(os.path.join(META_DIR, 'items.json'))
    for id, data in items.items():
        cursor.execute('''
        INSERT OR REPLACE INTO items (id, name, description, spritenum)
        VALUES (?, ?, ?, ?)
        ''', (
            id,
            data.get('name', ''),
            data.get('desc', data.get('shortDesc', '')),
            data.get('spritenum', 0)
        ))

    # Abilities
    abilities = load_json(os.path.join(META_DIR, 'abilities.json'))
    for id, data in abilities.items():
        cursor.execute('''
        INSERT OR REPLACE INTO abilities (id, name, description)
        VALUES (?, ?, ?)
        ''', (
            id,
            data.get('name', ''),
            data.get('desc', data.get('shortDesc', ''))
        ))

    conn.commit()
    return pokedex, moves, items, abilities

def get_generation(format_name):
    match = re.match(r'gen(\d+)', format_name)
    if match:
        return int(match.group(1))
    return 0

def process_formats(index_conn, pokedex, moves, items, abilities):
    print("Processing data files...")
    index_cursor = index_conn.cursor()
    
    # Group files by format
    files = glob.glob(os.path.join(DATA_DIR, '*.json'))
    format_files = {}
    
    for file_path in files:
        filename = os.path.basename(file_path)
        # Filename format: format-rating.json (e.g., gen9ou-1825.json)
        # Some might be just format.json if rating is 0 and implied? No, usually format-0.json
        
        parts = os.path.splitext(filename)[0].rsplit('-', 1)
        if len(parts) != 2:
            continue
            
        format_id = parts[0]
        rating = int(parts[1])
        
        if format_id not in format_files:
            format_files[format_id] = []
        format_files[format_id].append((rating, file_path))

    # Create lookup maps for fuzzy matching optimization
    print("Creating lookup maps...")
    lookup_maps = {
        'moves': create_lookup_map(moves.keys()),
        'items': create_lookup_map(items.keys()),
        'abilities': create_lookup_map(abilities.keys()),
        'pokedex': create_lookup_map(pokedex.keys())
    }

    for format_id, file_list in format_files.items():
        print(f"Processing format: {format_id}")
        
        # Create/Connect to format DB
        format_db_path = os.path.join(DB_DIR, f"{format_id}.png")
        format_conn = sqlite3.connect(format_db_path)
        init_format_db(format_conn)
        format_cursor = format_conn.cursor()
        
        total_battles_max = 0
        generation = get_generation(format_id)
        
        try:
            for rating, file_path in file_list:
                print(f"  Processing rating {rating}...")
                content = load_json(file_path)
                if not content:
                    continue
                
                if 'info' in content and 'data' in content:
                    info = content['info']
                    usage_data = content['data']
                    battles = info.get('number of battles', 0)
                    if rating == 0: # Use battles from baseline for total
                        total_battles_max = max(total_battles_max, battles)
                else:
                    usage_data = content
                
                # Create usage lookup for this file
                usage_lookup = create_lookup_map(usage_data.keys())

                # Process Pokemon
                for pokemon_name in usage_data.keys():
                    stats = collect_pokemon_stats(pokemon_name, usage_data, pokedex, moves, items, abilities, lookup_maps['pokedex'], usage_lookup)
                    
                    if not stats:
                        continue
                    
                    slug = pokemon_name.lower().replace(' ', '-').replace('.', '').replace("'", "")
                    usage_percent = stats['usage']['usage_percent']
                    rank = stats['usage']['rank']
                    
                    # Insert into Format DB (Details)
                    format_cursor.execute('''
                    INSERT OR REPLACE INTO pokemon_details (pokemon_name, rating, data)
                    VALUES (?, ?, ?)
                    ''', (
                        pokemon_name,
                        rating,
                        json.dumps(stats)
                    ))
                    
                    # Insert into Index DB (Rankings)
                    index_cursor.execute('''
                    INSERT OR REPLACE INTO rankings (format_id, pokemon_name, slug, rating, usage_percent, rank)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        format_id,
                        pokemon_name,
                        slug,
                        rating,
                        usage_percent,
                        rank
                    ))
            
            format_conn.commit()
            index_conn.commit() # Commit rankings for this rating
            
            # Update Index DB Format Info
            index_cursor.execute('''
            INSERT OR REPLACE INTO formats (id, name, generation, total_battles)
            VALUES (?, ?, ?, ?)
            ''', (format_id, format_id, generation, total_battles_max))
            index_conn.commit()
            
        except Exception as e:
            print(f"Error processing format {format_id}: {e}")
            format_conn.rollback()
        finally:
            format_conn.close()

def main():
    print(f"Building databases in {PUBLIC_DIR}")
    
    # Ensure directories exist
    os.makedirs(DB_DIR, exist_ok=True)
    
    # Connect to Index DB
    index_conn = sqlite3.connect(INDEX_DB_PATH)
    
    try:
        init_index_db(index_conn)
        pokedex, moves, items, abilities = populate_meta(index_conn)
        process_formats(index_conn, pokedex, moves, items, abilities)
        print("Database build complete!")
    finally:
        index_conn.close()

if __name__ == '__main__':
    main()
