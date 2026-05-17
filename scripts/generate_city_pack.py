#!/usr/bin/env python3
import argparse, json
from pathlib import Path
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--city-id", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--center-lat", type=float, required=True)
    parser.add_argument("--center-lon", type=float, required=True)
    parser.add_argument("--north", type=float, required=True)
    parser.add_argument("--south", type=float, required=True)
    parser.add_argument("--east", type=float, required=True)
    parser.add_argument("--west", type=float, required=True)
    parser.add_argument("--width-m", type=float, required=True)
    parser.add_argument("--height-m", type=float, required=True)
    parser.add_argument("--rotation-deg", type=float, default=0.0)
    parser.add_argument("--image-name", default="base.png")
    args = parser.parse_args()
    city_dir = Path(args.root) / "public" / "assets" / "cities" / args.city_id
    city_dir.mkdir(parents=True, exist_ok=True)
    meta = {
        "city_id": args.city_id, "name": args.name,
        "center_lat": args.center_lat, "center_lon": args.center_lon,
        "bounds": {"north": args.north, "south": args.south, "east": args.east, "west": args.west},
        "width_m": args.width_m, "height_m": args.height_m,
        "rotation_deg": args.rotation_deg,
        "image": f"/assets/cities/{args.city_id}/{args.image_name}"
    }
    (city_dir / "meta.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(city_dir)
if __name__ == "__main__":
    main()
