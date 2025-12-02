import os
import sys
import json
import argparse
from . import process_data

def find_pokemon_countered_by(target_pokemon, stats_file):
    print(f"Loading stats from {stats_file}...")
    usage_data_full = process_data.load_data(stats_file)
    if not usage_data_full:
        print("Failed to load stats file.")
        return []

    usage_data = usage_data_full.get("data", {})
    
    matched_target = process_data.fuzzy_match(target_pokemon, usage_data.keys())
    if not matched_target:
        print(f"Pokemon '{target_pokemon}' not found in data.")
        return []
    
    print(f"Analyzing data for '{matched_target}'...")
    target_pokemon = matched_target
    
    countered_list = []
    
    all_pokemon = list(usage_data.keys())
    
    for pokemon in all_pokemon:
        counters = process_data.extract_checks_and_counters(usage_data, pokemon)

        for rank, counter in enumerate(counters):
            if counter['name'] == target_pokemon:
                countered_list.append({
                    "name": pokemon,
                    "rank": rank + 1,
                    "score": counter['score'],
                    "count": counter['count']
                })
                break
                
    countered_list.sort(key=lambda x: x['score'], reverse=True)
    
    return countered_list

def generate_counters_leaderboard(stats_file, top_n=50, show_victims=False):
    print(f"Loading stats from {stats_file}...")
    usage_data_full = process_data.load_data(stats_file)
    if not usage_data_full:
        print("Failed to load stats file.")
        return

    usage_data = usage_data_full.get("data", {})
    all_pokemon = list(usage_data.keys())
    
    counter_stats = {}
    
    print(f"Analyzing counters for {len(all_pokemon)} Pokemon...")
    
    for pokemon in all_pokemon:
        counters = process_data.extract_checks_and_counters(usage_data, pokemon)
        
        for counter in counters:
            c_name = counter['name']
            c_score = counter['score']
            
            if c_name not in counter_stats:
                counter_stats[c_name] = { "count": 0, "total_score": 0, "victims": [] }
            
            counter_stats[c_name]["count"] += 1
            counter_stats[c_name]["total_score"] += c_score
            counter_stats[c_name]["victims"].append(pokemon)

    leaderboard = []
    for name, stats in counter_stats.items():
        avg_score = stats["total_score"] / stats["count"] if stats["count"] > 0 else 0
        leaderboard.append({
            "name": name,
            "count": stats["count"],
            "avg_score": avg_score
        })
        
    leaderboard.sort(key=lambda x: (x['count'], x['avg_score']), reverse=True)
    
    print(f"\n--- Top {top_n} Most Common Counters ---")
    if not show_victims:
        print(f"{'Rank':<5} | {'Pokemon':<25} | {'Counter Count':<15} | {'Avg Score':<10}")
        print("-" * 65)
    
    for i, entry in enumerate(leaderboard[:top_n]):
        if show_victims:
            print(f"\n#{i+1} {entry['name']} (Counters {entry['count']} Pokemon, Avg Score: {entry['avg_score']:.2f})")
            victims = counter_stats[entry['name']]['victims']
            print(f"Countered: {', '.join(victims)}")
        else:
            print(f"{i+1:<5} | {entry['name']:<25} | {entry['count']:<15} | {entry['avg_score']:<10.2f}")

def get_stats(pokemon_name, format_id, date=None):
    DATE = date or process_data.get_latest_date()
    if not DATE:
        print("No date folder found in data directory.")
        return
        
    filename = process_data.get_best_stats_file(os.path.join("data", DATE), format_id)
    if not filename:
        print(f"No stats file found for format '{format_id}' in {DATE}.")
        return
    STATS_FILE = os.path.join("data", DATE, "data", filename)
    META_DIR = os.path.join("data", "meta")
    
    print(f"Loading stats from {STATS_FILE}...")
    usage_data_full = process_data.load_data(STATS_FILE)
    if not usage_data_full:
        print(f"Failed to load stats file: {STATS_FILE}")
        return

    usage_data = usage_data_full.get("data", {})
    
    if not pokemon_name:
        print("No Pokemon specified. Using top Pokemon of the format...")
        pokemon_name = process_data.get_top_pokemon(usage_data)
        if not pokemon_name:
            print("Could not determine top Pokemon.")
            return
        print(f"Top Pokemon is: {pokemon_name}")
    
    print("Loading metadata...")
    pokedex = process_data.load_data(os.path.join(META_DIR, "pokedex.json"))
    moves = process_data.load_data(os.path.join(META_DIR, "moves.json"))
    items = process_data.load_data(os.path.join(META_DIR, "items.json"))
    abilities = process_data.load_data(os.path.join(META_DIR, "abilities.json"))
    
    print(f"Collecting stats for '{pokemon_name}'...")
    stats = process_data.collect_pokemon_stats(pokemon_name, usage_data, pokedex, moves, items, abilities)
    
    if stats:
        print(json.dumps(stats, indent=2))
    else:
        print(f"Pokemon '{pokemon_name}' not found.")

def main():
    parser = argparse.ArgumentParser(description="Pokemon Stats Analysis Tool")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Stats command
    stats_parser = subparsers.add_parser("stats", help="Get detailed stats for a Pokemon")
    stats_parser.add_argument("pokemon", nargs="?", help="Name of the Pokemon")
    stats_parser.add_argument("--format", default="gen9ou", help="Format to use (default: gen9ou)")
    
    # Counters command
    counters_parser = subparsers.add_parser("counters", help="Find what a Pokemon counters")
    counters_parser.add_argument("pokemon", nargs="?", help="Name of the Pokemon (or 'chart' for leaderboard)")
    counters_parser.add_argument("--format", default="gen9ou", help="Format to use (default: gen9ou)")
    counters_parser.add_argument("--chart", action="store_true", help="Show leaderboard of top counters")
    counters_parser.add_argument("--top5", action="store_true", help="Show detailed victims for top 5 counters")
    
    args = parser.parse_args()
    
    if args.command == "stats":
        get_stats(args.pokemon, args.format)
        
    elif args.command == "counters":
        DATE = process_data.get_latest_date()
        if not DATE:
            print("No date folder found in data directory.")
            sys.exit(1)
            
        filename = process_data.get_best_stats_file(os.path.join("data", DATE), args.format)
        if not filename:
            print(f"No stats file found for format '{args.format}' in {DATE}.")
            sys.exit(1)
        STATS_FILE = os.path.join("data", DATE, "data", filename)
        
        mode = "search"
        target = args.pokemon
        
        if args.chart or (target and target.lower() == "chart"):
            mode = "chart"
        elif args.top5 or (target and target.lower() == "top5-detailed"):
            mode = "top5"
        
        if mode == "chart":
            generate_counters_leaderboard(STATS_FILE)
        elif mode == "top5":
            generate_counters_leaderboard(STATS_FILE, top_n=5, show_victims=True)
        else:
            if not target:
                usage_data_full = process_data.load_data(STATS_FILE)
                usage_data = usage_data_full.get("data", {})
                target = process_data.get_top_pokemon(usage_data)
                print(f"Top Pokemon is: {target}")
                
            results = find_pokemon_countered_by(target, STATS_FILE)
            
            if results:
                print(f"\n'{target}' is a counter for the following {len(results)} Pokemon:\n")
                print(f"{'Pokemon':<25} | {'Rank':<5} | {'Score':<10} | {'Count':<10}")
                print("-" * 60)
                for item in results:
                    print(f"{item['name']:<25} | {item['rank']:<5} | {item['score']:<10} | {item['count']:<10}")
            else:
                print(f"\n'{target}' is not a counter for any Pokemon in this dataset.")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
