import os
import requests
import re
import json

META_DIR = os.path.join("data", "meta")

def fix_js_to_json(js_content):
    content = re.sub(r'//.*', '', js_content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    content = re.sub(r'(?<=[\{\,])\s*([a-zA-Z0-9_]+):', r' "\1":', content)
    
    content = re.sub(r',(\s*[\}\]])', r'\1', content)
    
    return content

def extract_battle_icon_indexes_from_url(url, output_path):
    print(f"Downloading form data from {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        content = response.text
        
        start = content.find('{')
        end = content.rfind('}')
        
        if start != -1 and end != -1:
            raw_obj = content[start:end+1]
            
            try:
                json.loads(raw_obj)
                final_content = raw_obj
            except json.JSONDecodeError:
                final_content = re.sub(r',(\s*[\}\]])', r'\1', raw_obj)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(final_content)
            print(f"Saved to {output_path}")
        else:
            print("Could not find JSON object in response.")
            
    except Exception as e:
        print(f"Failed to extract icons index: {e}")

def download_meta():
    os.makedirs(META_DIR, exist_ok=True)
    
    print("Getting item data.")
    url = 'https://play.pokemonshowdown.com/data/items.js'
    try:
        itemJS = requests.get(url).text
        start_idx = itemJS.find('{')
        if start_idx != -1:
            itemRaw = itemJS[start_idx:]
            if itemRaw.strip().endswith(';'):
                itemRaw = itemRaw.strip()[:-1]
            
            itemRaw = fix_js_to_json(itemRaw)
            
            with open(os.path.join(META_DIR, 'items.json'), 'w', encoding="utf-8") as file:
                file.write(itemRaw)
    except Exception as e:
        print(f"Error downloading items: {e}")

    print("Getting ability data.")
    url = 'https://play.pokemonshowdown.com/data/abilities.js'
    try:
        abilitiesJS = requests.get(url).text
        start_idx = abilitiesJS.find('{')
        if start_idx != -1:
            abilitiesRaw = abilitiesJS[start_idx:]
            if abilitiesRaw.strip().endswith(';'):
                abilitiesRaw = abilitiesRaw.strip()[:-1]
            
            abilitiesRaw = fix_js_to_json(abilitiesRaw)
            
            with open(os.path.join(META_DIR, 'abilities.json'), 'w', encoding="utf-8") as file:
                file.write(abilitiesRaw)
    except Exception as e:
        print(f"Error downloading abilities: {e}")

    print("Getting move data.")
    url = 'https://play.pokemonshowdown.com/data/moves.json'
    try:
        movesRaw = requests.get(url).text
        with open(os.path.join(META_DIR, 'moves.json'), 'w', encoding="utf-8") as file:
            file.write(movesRaw)
    except Exception as e:
        print(f"Error downloading moves: {e}")

    print("Getting pokedex data.")
    url = 'https://play.pokemonshowdown.com/data/pokedex.json'
    try:
        pokedexRaw = requests.get(url).text
        with open(os.path.join(META_DIR, 'pokedex.json'), 'w', encoding="utf-8") as file:
            file.write(pokedexRaw)
    except Exception as e:
        print(f"Error downloading pokedex: {e}")

    print("Getting form data.")
    url = 'https://raw.githubusercontent.com/smogon/sprites/master/ps-pokemon.sheet.mjs'
    extract_battle_icon_indexes_from_url(url, os.path.join(META_DIR, 'forms_index.json'))

if __name__ == "__main__":
    download_meta()
