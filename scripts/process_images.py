import os
from PIL import Image
import glob

# Source directory (artifacts)
SOURCE_DIR = r"C:\Users\userv\.gemini\antigravity\brain\06f0f6e1-4b4c-43c1-a6ed-b9efe159d46b"
# Destination directory
DEST_DIR = r"C:\Users\userv\Journify-v1\public\images\decorations"

# Ensure destination exists
os.makedirs(DEST_DIR, exist_ok=True)

# Files to process
files = [
    "space_suit", "wizard_hat", "sunglasses", "star_cookie", "moon_milk", "toy_rocket"
]

def remove_white_bg(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if white (high RGB values)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    return img

print("Processing images...")

# Find files matching the names (since they have timestamps)
all_files = os.listdir(SOURCE_DIR)

for base_name in files:
    found = False
    for filename in all_files:
        if filename.startswith(base_name) and filename.endswith(".png"):
            source_path = os.path.join(SOURCE_DIR, filename)
            dest_path = os.path.join(DEST_DIR, f"{base_name.replace('_', '-')}.png")
            
            try:
                img = Image.open(source_path)
                img = remove_white_bg(img)
                img.save(dest_path, "PNG")
                print(f"Processed {filename} -> {dest_path}")
                found = True
                break # Just take the first match
            except Exception as e:
                print(f"Failed to process {filename}: {e}")
                
    if not found:
        print(f"Warning: Could not find image for {base_name}")

print("Done.")
