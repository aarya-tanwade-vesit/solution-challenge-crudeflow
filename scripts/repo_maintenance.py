import os
import shutil
import glob

base_path = r"c:\Users\Aarya Tanwade\Desktop\nemo\crudeflow"
frontend_path = os.path.join(base_path, "frontend")
docs_path = os.path.join(base_path, "docs")
docs_frontend_path = os.path.join(docs_path, "frontend")
docs_scripts_path = os.path.join(docs_frontend_path, "scripts")
docs_logs_path = os.path.join(docs_frontend_path, "logs")

# Fix: docs/frontend might be a file
if os.path.isfile(docs_frontend_path):
    print(f"Renaming file {docs_frontend_path} to {docs_frontend_path}_summary.md")
    shutil.move(docs_frontend_path, docs_frontend_path + "_summary.md")

# Create directories
os.makedirs(docs_frontend_path, exist_ok=True)
os.makedirs(docs_scripts_path, exist_ok=True)
os.makedirs(docs_logs_path, exist_ok=True)

# Move markdown and text files (except README.md)
md_files = glob.glob(os.path.join(frontend_path, "*.md"))
txt_files = glob.glob(os.path.join(frontend_path, "*.txt"))

for f in md_files + txt_files:
    filename = os.path.basename(f)
    if filename.lower() == "readme.md":
        continue
    dest = os.path.join(docs_frontend_path, filename)
    print(f"Moving {f} to {dest}")
    try:
        shutil.move(f, dest)
    except Exception as e:
        print(f"Error moving {f}: {e}")

# Move scripts
scripts_to_move = ["START.bat", "START.ps1"]
for s in scripts_to_move:
    src = os.path.join(frontend_path, s)
    if os.path.exists(src):
        dest = os.path.join(docs_scripts_path, s)
        print(f"Moving {src} to {dest}")
        shutil.move(src, dest)

# Move logs
log_files = glob.glob(os.path.join(frontend_path, "*.log"))
for l in log_files:
    dest = os.path.join(docs_logs_path, os.path.basename(l))
    print(f"Moving {l} to {dest}")
    shutil.move(l, dest)

# Create missing frontend directories
frontend_dirs = ["data", "services", "constants", "animations", "providers", "assets"]
for d in frontend_dirs:
    dir_path = os.path.join(frontend_path, d)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        # Add a placeholder to keep it in git
        with open(os.path.join(dir_path, ".gitkeep"), "w") as f:
            f.write("")

# Backend organization
backend_path = os.path.join(base_path, "backend")
backend_app_path = os.path.join(backend_path, "app")
backend_dirs = ["schemas", "models", "services", "optimization", "middleware", "core", "db", "utils", "constants", "diagnostics", "simulation", "analytics"]
for d in backend_dirs:
    dir_path = os.path.join(backend_app_path, d)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        with open(os.path.join(dir_path, ".gitkeep"), "w") as f:
            f.write("")

# Remove duplicate script in backend
duplicate_script = os.path.join(backend_path, "seed_neon_fixed.py")
if os.path.exists(duplicate_script):
    os.remove(duplicate_script)

print("Organization complete.")
