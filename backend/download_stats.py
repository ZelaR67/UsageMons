import os
import requests
from bs4 import BeautifulSoup
import gzip
import shutil
from urllib.parse import urljoin
import datetime

def get_prev_month(date_str):
    year, month = map(int, date_str.split('-'))
    dt = datetime.date(year, month, 1)
    # Go back one day to get the previous month
    prev_month_date = dt - datetime.timedelta(days=1)
    return prev_month_date.strftime("%Y-%m")

def download_all(date_str):
    base_url = f"https://www.smogon.com/stats/{date_str}/chaos/"
    # Assuming 'data' is the root folder for all stats
    raw_dir = os.path.join("data", date_str, "raw")
    
    os.makedirs(raw_dir, exist_ok=True)

    print(f"Fetching file list from {base_url}...")
    try:
        response = requests.get(base_url)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching page: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    links = soup.find_all('a')
    
    # Filter for .json.gz files
    json_gz_links = [link.get('href') for link in links if link.get('href', '').endswith('.json.gz')]
    
    print(f"Found {len(json_gz_links)} files to download for {date_str}.")

    for filename in json_gz_links:
        file_url = urljoin(base_url, filename)
        raw_path = os.path.join(raw_dir, filename)

        if os.path.exists(raw_path):
            print(f"Skipping {filename} (already exists)")
            continue

        print(f"Downloading {filename}...")
        try:
            with requests.get(file_url, stream=True) as r:
                r.raise_for_status()
                with open(raw_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
        except Exception as e:
            print(f"Failed to download {filename}: {e}")

def extract_all(date_str):
    raw_dir = os.path.join("data", date_str, "raw")
    data_dir = os.path.join("data", date_str, "data")
    
    if not os.path.exists(raw_dir):
        print(f"Raw directory {raw_dir} does not exist. Nothing to extract.")
        return

    os.makedirs(data_dir, exist_ok=True)
    
    # List all .gz files in raw_dir
    files = [f for f in os.listdir(raw_dir) if f.endswith('.json.gz')]
    print(f"Found {len(files)} files to extract in {raw_dir}.")

    for filename in files:
        raw_path = os.path.join(raw_dir, filename)
        # Remove .gz extension for the output filename
        json_filename = filename[:-3] 
        json_path = os.path.join(data_dir, json_filename)

        if os.path.exists(json_path):
            print(f"Skipping extraction of {json_filename} (already exists)")
            continue

        print(f"Extracting {filename} to {json_filename}...")
        try:
            with gzip.open(raw_path, 'rb') as f_in:
                with open(json_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
        except Exception as e:
            print(f"Failed to extract {filename}: {e}")

def delete_all(date_str):
    data_dir = os.path.join("data", date_str, "data")
    if os.path.exists(data_dir):
        print(f"Deleting {data_dir}...")
        shutil.rmtree(data_dir)
        print("Deleted.")
    else:
        print(f"Directory {data_dir} does not exist.")

if __name__ == "__main__":
    # Example usage:
    # 1. Get current date string
    today = datetime.date.today()
    current_month_str = today.strftime("%Y-%m")
    
    # 2. Get previous month
    target_month = get_prev_month(current_month_str)
    print(target_month)
    print(f"Targeting stats for: {target_month}")

    # 3. Download
    download_all(target_month)

    # 4. Extract
    extract_all(target_month)
    
    # 5. Delete (commented out by default to preserve data)
    # delete_all(target_month)