import json
import math
import difflib
import os
import re

def load_data(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def fuzzy_match(target, options):
    normalized_options = {option.lower(): option for option in options}
    matches = difflib.get_close_matches(target.lower(), normalized_options.keys(), n=1, cutoff=0.6)
    return normalized_options[matches[0]] if matches else None

def get_top_pokemon(usage_data):
    if not usage_data:
        return None
    sorted_pokemon = sorted(usage_data.keys(), key=lambda name: usage_data[name].get("usage", 0), reverse=True)
    return sorted_pokemon[0] if sorted_pokemon else None

def get_total_weight(pokemon_data):
    return max(sum(pokemon_data.get("Abilities", {"Unknown": 1}).values()), 1)

def extract_usage_stats(usage_data, pokemon_name):
    if not usage_data:
        return None
    
    sorted_pokemon = sorted(usage_data.keys(), key=lambda name: usage_data[name].get("usage", 0), reverse=True)
    
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return None
    
    try:
        rank = sorted_pokemon.index(matched_name) + 1
    except ValueError:
        rank = -1
        
    usage_val = usage_data[matched_name].get("usage", 0)
    usage_percent = round(usage_val * 100, 3)
    
    return {
        "name": matched_name,
        "rank": rank,
        "usage_percent": usage_percent
    }

def extract_base_stats(pokemon_name, pokedex_data):
    if not pokedex_data:
        return []
        
    matched_name = fuzzy_match(pokemon_name, pokedex_data.keys())
    if not matched_name:
        return []
        
    stats = pokedex_data[matched_name].get("baseStats", {})
    return [stats.get(k, 0) for k in ["hp", "atk", "def", "spa", "spd", "spe"]]

def extract_types(pokemon_name, pokedex_data):
    if not pokedex_data:
        return []

    matched_name = fuzzy_match(pokemon_name, pokedex_data.keys())
    if not matched_name:
        return []
        
    return pokedex_data[matched_name].get("types", [])

def extract_moves(usage_data, pokemon_name, move_details=None):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    moves = pokemon_data.get("Moves", {})
    total_weight = get_total_weight(pokemon_data)
    
    sorted_moves = sorted(moves.keys(), key=lambda m: moves[m], reverse=True)
    
    result = []
    for move in sorted_moves:
        usage_percent = (moves[move] / total_weight) * 100
        
        real_name = move
        if move_details and move in move_details:
             real_name = move_details[move].get("name", move)
        
        result.append({
            "name": real_name,
            "id": move,
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_teammates(usage_data, pokemon_name):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    teammates = pokemon_data.get("Teammates", {})
    total_weight = get_total_weight(pokemon_data)
    
    if total_weight < sum(teammates.values()) / 6:
        total_weight = sum(teammates.values()) / 6
        
    sorted_teammates = sorted(teammates.keys(), key=lambda x: teammates[x], reverse=True)
    
    result = []
    for poke in sorted_teammates:
        usage_percent = (teammates[poke] / total_weight) * 100
        result.append({
            "name": poke,
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_items(usage_data, pokemon_name, item_details=None):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    items = pokemon_data.get("Items", {})
    total_weight = max(sum(items.values()), 1)
    
    sorted_items = sorted(items.keys(), key=lambda x: items[x], reverse=True)
    
    result = []
    for item in sorted_items:
        usage_percent = (items[item] / total_weight) * 100
        
        real_name = item
        if item_details and item in item_details:
             real_name = item_details[item].get("name", item)
        
        result.append({
            "name": real_name,
            "id": item,
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_abilities(usage_data, pokemon_name, ability_details=None):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    abilities = pokemon_data.get("Abilities", {})
    total_weight = max(sum(abilities.values()), 1)
    
    sorted_abilities = sorted(abilities.keys(), key=lambda x: abilities[x], reverse=True)
    
    result = []
    for ability in sorted_abilities:
        usage_percent = (abilities[ability] / total_weight) * 100
        
        real_name = ability
        if ability_details and ability in ability_details:
             real_name = ability_details[ability].get("name", ability)
        
        result.append({
            "name": real_name,
            "id": ability,
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_natures(usage_data, pokemon_name):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    spreads = pokemon_data.get("Spreads", {})
    
    nature_weights = {}
    for spread_key, weight in spreads.items():
        nature = spread_key.split(':')[0]
        nature_weights[nature] = nature_weights.get(nature, 0) + weight
        
    total_weight = get_total_weight(pokemon_data)
    
    sorted_natures = sorted(nature_weights.keys(), key=lambda x: nature_weights[x], reverse=True)
    
    result = []
    for nature in sorted_natures:
        usage_percent = (nature_weights[nature] / total_weight) * 100
        result.append({
            "name": nature,
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_spreads(usage_data, pokemon_name):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    spreads = pokemon_data.get("Spreads", {})
    total_weight = max(sum(spreads.values()), 1)
    
    sorted_spreads = sorted(spreads.keys(), key=lambda s: spreads[s], reverse=True)
    
    result = []
    
    count_above_threshold = 0
    for spread in sorted_spreads:
        usage_percent = (spreads[spread] / total_weight) * 100
        if usage_percent >= 1.0:
            count_above_threshold += 1
            
    limit = max(5, count_above_threshold)
    
    for i, spread in enumerate(sorted_spreads):
        if i >= limit:
            break
        usage_percent = (spreads[spread] / total_weight) * 100
        result.append({
            "spread": spread,
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_evs(usage_data, pokemon_name):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return {}
        
    pokemon_data = usage_data[matched_name]
    spreads = pokemon_data.get("Spreads", {})
    total_count = get_total_weight(pokemon_data)
    
    ev_data = {"atk": {}, "spa": {}, "spe": {}, "hp_def": {}, "hp_spd": {}}
    
    attack_natures = ["Naughty", "Adamant", "Lonely", "Brave"]
    defense_natures = ["Bold", "Relaxed", "Impish", "Lax"]
    sattack_natures = ["Modest", "Mild", "Quiet", "Rash"]
    sdefense_natures = ["Calm", "Gentle", "Sassy", "Careful"]
    speed_natures = ["Timid", "Hasty", "Jolly", "Naive"]
    
    attack_natures_m = ["Bold", "Timid", "Modest", "Calm"]
    defense_natures_m = ["Lonely", "Hasty", "Mild", "Gentle"]
    sattack_natures_m = ["Adamant", "Impish", "Jolly", "Careful"]
    sdefense_natures_m = ["Naughty", "Lax", "Naive", "Rash"]
    speed_natures_m = ["Brave", "Relaxed", "Quiet", "Sassy"]
    
    for spread, weight in spreads.items():
        parts = spread.split(':')
        nature = parts[0]
        evs = parts[1].split('/')
        
        pa = "+" if nature in attack_natures else ("-" if nature in attack_natures_m else "")
        pd = "+" if nature in defense_natures else ("-" if nature in defense_natures_m else "")
        psa = "+" if nature in sattack_natures else ("-" if nature in sattack_natures_m else "")
        psd = "+" if nature in sdefense_natures else ("-" if nature in sdefense_natures_m else "")
        pse = "+" if nature in speed_natures else ("-" if nature in speed_natures_m else "")
        
        key_atk = f"{evs[1]}{pa} Atk"
        key_spa = f"{evs[3]}{psa} SpA"
        key_spe = f"{evs[5]}{pse} Spe"
        key_hp_def = f"{evs[0]} HP / {evs[2]}{pd} Def"
        key_hp_spd = f"{evs[0]} HP / {evs[4]}{psd} SpD"
        
        ev_data["atk"][key_atk] = ev_data["atk"].get(key_atk, 0) + weight
        ev_data["spa"][key_spa] = ev_data["spa"].get(key_spa, 0) + weight
        ev_data["spe"][key_spe] = ev_data["spe"].get(key_spe, 0) + weight
        ev_data["hp_def"][key_hp_def] = ev_data["hp_def"].get(key_hp_def, 0) + weight
        ev_data["hp_spd"][key_hp_spd] = ev_data["hp_spd"].get(key_hp_spd, 0) + weight
        
    result = {}
    for category in ev_data:
        sorted_evs = sorted(ev_data[category].keys(), key=lambda x: ev_data[category][x], reverse=True)
        
        count_above_threshold = 0
        for ev_key in sorted_evs:
            usage_percent = (ev_data[category][ev_key] / total_count) * 100
            if usage_percent >= 1.0:
                count_above_threshold += 1
        
        limit = max(5, count_above_threshold)
        
        result[category] = []
        for i, ev_key in enumerate(sorted_evs):
            if i >= limit:
                break
            usage_percent = (ev_data[category][ev_key] / total_count) * 100
            result[category].append({
                "ev_string": ev_key,
                "usage_percent": round(usage_percent, 3)
            })
            
    return result

def extract_tera_types(usage_data, pokemon_name):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    tera_types = pokemon_data.get("Tera Types", {})
    total_weight = max(sum(tera_types.values()), 1)
    
    sorted_tera = sorted(tera_types.keys(), key=lambda x: tera_types[x], reverse=True)
    
    result = []
    for tera in sorted_tera:
        usage_percent = (tera_types[tera] / total_weight) * 100
        result.append({
            "tera_type": tera.capitalize(),
            "usage_percent": round(usage_percent, 3)
        })
        
    return result

def extract_checks_and_counters(usage_data, pokemon_name):
    matched_name = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_name:
        return []
        
    pokemon_data = usage_data[matched_name]
    counters = pokemon_data.get("Checks and Counters", {})
    
    filtered_counters = {k: v for k, v in counters.items() if (v[2] < 0.1 and v[1] > 0.5)}
    
    sorted_counters = sorted(filtered_counters.keys(), key=lambda x: filtered_counters[x][1], reverse=True)
    
    result = []
    for counter in sorted_counters:
        score = filtered_counters[counter][1]
        result.append({
            "name": counter,
            "score": round(score * 100, 3)
        })
        
    return result

def extract_dominates(usage_data, pokemon_name):
    matched_target = fuzzy_match(pokemon_name, usage_data.keys())
    if not matched_target:
        return []
    
    dominates_list = []
    
    for pokemon, data in usage_data.items():
        if pokemon == matched_target:
            continue
            
        counters = data.get("Checks and Counters", {})
        
        if matched_target in counters:
            stats = counters[matched_target]
            score = stats[1]
            
            if score > 0.5 and stats[2] < 0.1:
                dominates_list.append({
                    "name": pokemon,
                    "score": round(score * 100, 3)
                })
                
    dominates_list.sort(key=lambda x: x['score'], reverse=True)
    
    return dominates_list

def collect_pokemon_stats(pokemon_name, usage_data, pokedex, moves, items, abilities):
    usage_stats = extract_usage_stats(usage_data, pokemon_name)
    
    if not usage_stats:
        return None
    
    real_name = usage_stats["name"]
        
    return {
        "name": real_name,
        "usage": usage_stats,
        "base_stats": extract_base_stats(real_name, pokedex),
        "types": extract_types(real_name, pokedex),
        "possible_abilities": extract_possible_abilities(real_name, pokedex),
        "moves": extract_moves(usage_data, real_name, moves),
        "teammates": extract_teammates(usage_data, real_name),
        "items": extract_items(usage_data, real_name, items),
        "abilities": extract_abilities(usage_data, real_name, abilities),
        "natures": extract_natures(usage_data, real_name),
        "spreads": extract_spreads(usage_data, real_name),
        "evs": extract_evs(usage_data, real_name),
        "tera_types": extract_tera_types(usage_data, real_name),
        "counters": extract_checks_and_counters(usage_data, real_name),
        "dominates": extract_dominates(usage_data, real_name)
    }

def get_latest_date(data_dir="data"):
    if not os.path.exists(data_dir):
        return None
        
    subdirs = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
    
    date_pattern = re.compile(r"^\d{4}-\d{2}$")
    date_dirs = [d for d in subdirs if date_pattern.match(d)]
    
    if not date_dirs:
        return None
        
    date_dirs.sort(reverse=True)
    return date_dirs[0]

def get_best_stats_file(date_dir, format_prefix):
    data_path = os.path.join(date_dir, "data")
    if not os.path.exists(data_path):
        return None
        
    if "-" in format_prefix:
         if os.path.exists(os.path.join(data_path, f"{format_prefix}.json")):
             return f"{format_prefix}.json"
    
    files = [f for f in os.listdir(data_path) if f.startswith(format_prefix + "-") and f.endswith(".json")]
    
    if not files:
        if os.path.exists(os.path.join(data_path, f"{format_prefix}.json")):
            return f"{format_prefix}.json"
        return None
        
    best_file = None
    max_rating = -1
    
    for f in files:
        try:
            name = os.path.splitext(f)[0]
            parts = name.split("-")
            rating = int(parts[-1])
            
            if rating > max_rating:
                max_rating = rating
                best_file = f
        except ValueError:
            continue
            
    return best_file if best_file else files[0]

def extract_possible_abilities(pokemon_name, pokedex_data):
    if not pokedex_data:
        return []

    matched_name = fuzzy_match(pokemon_name, pokedex_data.keys())
    if not matched_name:
        return []
        
    abilities = pokedex_data[matched_name].get("abilities", {})
    return list(abilities.values())
