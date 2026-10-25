import os
import sys
import zipfile

dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
zip_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'wowfilewala-hostinger-public_html.zip')

if not os.path.exists(dist_dir):
    print("dist directory does not exist")
    sys.exit(1)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(dist_dir):
        if 'aistudio' in root.split(os.sep):
            continue
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, dist_dir)
            zf.write(full_path, rel_path)

print(f"Created {zip_path} successfully")
