from PIL import Image
from pathlib import Path

tiles_root = Path("public/assets/city_tiles/city_53389926/15")
out_path = Path("public/assets/cities/city_53389926/base.png")

tiles = []
for x_dir in tiles_root.iterdir():
    if not x_dir.is_dir():
        continue
    try:
        x = int(x_dir.name)
    except ValueError:
        continue
    for y_file in x_dir.glob("*.jpg"):
        try:
            y = int(y_file.stem)
        except ValueError:
            continue
        tiles.append((x, y, y_file))

if not tiles:
    raise SystemExit("No tiles found.")

xs = sorted({x for x, _, _ in tiles})
ys = sorted({y for _, y, _ in tiles})

min_x, max_x = min(xs), max(xs)
min_y, max_y = min(ys), max(ys)

sample = Image.open(tiles[0][2])
tile_w, tile_h = sample.size
sample.close()

canvas = Image.new("RGB", ((max_x - min_x + 1) * tile_w, (max_y - min_y + 1) * tile_h))

for x, y, path in tiles:
    img = Image.open(path).convert("RGB")
    px = (x - min_x) * tile_w
    py = (y - min_y) * tile_h
    canvas.paste(img, (px, py))
    img.close()

out_path.parent.mkdir(parents=True, exist_ok=True)
canvas.save(out_path)
print(f"Saved stitched image to: {out_path}")
print(f"Canvas size: {canvas.size}")
print(f"Tile x range: {min_x}..{max_x}")
print(f"Tile y range: {min_y}..{max_y}")
