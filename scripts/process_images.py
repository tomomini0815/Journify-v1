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
    width, height = img.size
    
    # Simple thresholding is risky. Let's try to make "white" transparent.
    # A better heuristic for generated assets on white:
    # 1. Be more strict about what is "background" vs "highlight".
    # 2. Use flood fill from corners if possible (Pillow ImageDraw.floodfill doesn't do alpha, but we can do a mask).
    
    # Approach:
    # 1. Create a binary mask where white pixels are 0, others are 1.
    # 2. Use that to set alpha.
    
    datas = img.getdata()
    newData = []
    
    for item in datas:
        # Check if white (high RGB values) - make threshold slightly higher to avoid cutting into light content
        # Also check for near-white
        if item[0] > 245 and item[1] > 245 and item[2] > 245:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    return img

    # Note: Real flood fill in pure python/pillow without scipy/cv2 is complex to impl efficiently in one go.
    # The user complained about transparency "failed". Maybe too much was removed? Or not enough?
    # Usually generated images have shadows that are greyish white.
    # Let's try a different trick: Distance from white.
    
    # Actually, for game assets, they are usually centered.
    # Let's try "Flood fill" simulation using ImageDraw.floodfill on a temp image to identify background.
    
from PIL import ImageDraw

def remove_white_bg_flood(img):
    img = img.convert("RGBA")
    # Create a mask image for flood filling
    # We flood fill from (0,0) on a temp image.
    # If the corner isn't white, this fails. Assuming generated images have white backgrounds.
    
    # Tolerance for "whiteish"
    TOLERANCE = 10
    
    # Basic pixel access
    pixels = img.load()
    width, height = img.size
    
    # Queue for BFS flood fill
    # (x, y)
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    visited = set(queue)
    
    # We'll modify pixels in place to transparent
    # But we need to check initial color to confirm it's background
    
    def is_bg_color(r, g, b, a):
        return r > 240 and g > 240 and b > 240
        
    # Process queue
    # Note: BFS might be slow for large images in pure python, but these are small icons.
    # Let's limit iterations or use recursion carefully. 
    # Actually, iterative is better.
    
    while queue:
        x, y = queue.pop(0)
        
        # Check if out of bounds
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        r, g, b, a = pixels[x, y]
        
        if is_bg_color(r, g, b, a) and a != 0:
            # Set to transparent
            pixels[x, y] = (255, 255, 255, 0)
            
            # Add neighbors
            neighbors = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
            for nx, ny in neighbors:
                if (nx, ny) not in visited:
                    if 0 <= nx < width and 0 <= ny < height:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
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
                img = remove_white_bg_flood(img) # Use the new flood fill function
                img.save(dest_path, "PNG")
                print(f"Processed {filename} -> {dest_path}")
                found = True
                break # Just take the first match
            except Exception as e:
                print(f"Failed to process {filename}: {e}")
                
    if not found:
        print(f"Warning: Could not find image for {base_name}")

print("Done.")
