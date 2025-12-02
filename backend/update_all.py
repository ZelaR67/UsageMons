import os
import sys
import datetime
import time

# Add the current directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import download_stats
import download_meta
import build_db
import process_data

def main():
    print("=== Starting Data Update Process ===")
    
    # 1. Download Metadata
    print("\n--- Step 1: Downloading Metadata ---")
    download_meta.download_meta()
    
    # 2. Determine Target Date and Download Stats
    print("\n--- Step 2: Downloading Stats ---")
    
    if len(sys.argv) > 1:
        target_month = sys.argv[1]
        print(f"Using provided target month: {target_month}")
    else:
        today = datetime.date.today()
        current_month_str = today.strftime("%Y-%m")
        target_month = download_stats.get_prev_month(current_month_str)
        print(f"Targeting stats for: {target_month}")
    
    download_stats.download_all(target_month)
    download_stats.extract_all(target_month)
    
    # 3. Update Database
    print("\n--- Step 3: Building SQLite Database ---")
    
    try:
        build_db.main()
    except Exception as e:
        print(f"Error during database update: {e}")
        
    print("\n=== Update Process Complete ===")

if __name__ == "__main__":
    main()
