import os
import shutil
import subprocess
import sys

def run_command(command, cwd=None):
    print(f"Running: {command}")
    try:
        subprocess.check_call(command, shell=True, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        sys.exit(1)

def main():
    print("--- Building Static Site for GitHub Pages ---")
    
    print("\n[1/3] Generating Static API Data...")
    run_command("python build_static_api.py")
    
    print("\n[2/3] Building Frontend (Static Mode)...")
    
    if not os.path.exists(os.path.join("frontend", "node_modules")):
        print("Installing dependencies...")
        run_command("npm install", cwd="frontend")

    run_command("npm run build", cwd="frontend")
    
    print("\n[3/3] Finalizing Output...")
    dist_dir = os.path.join("frontend", "dist")
    
    with open(os.path.join(dist_dir, ".nojekyll"), "w") as f:
        f.write("")
        
    print(f"\nSuccess! Static site is ready in '{dist_dir}' folder.")
    print("You can now deploy this folder to GitHub Pages.")

if __name__ == "__main__":
    main()
