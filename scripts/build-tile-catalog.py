#!/usr/bin/env python3
"""
타일셋 PNG를 4행 단위 스트립으로 슬라이싱.
각 스트립에 GID 범위를 매핑하여 가구 식별용 카탈로그 생성.
"""

import json
from pathlib import Path

from PIL import Image

TILE_SIZE = 32
ROWS_PER_STRIP = 4
TILESET_DIR = Path("client/public/assets/tileset")
MAP_JSON = Path("client/public/assets/map/map.json")
OUTPUT_DIR = Path("_tile_catalog")

TILESETS = [
    ("Modern_Office_Black_Shadow", TILESET_DIR / "Modern_Office_Black_Shadow.png"),
    ("Generic", TILESET_DIR / "Generic.png"),
    ("Basement", TILESET_DIR / "Basement.png"),
    ("Classroom_and_library", TILESET_DIR / "Classroom_and_library.png"),
    ("Modern_Office_Addons", TILESET_DIR / "Modern_Office_Addons.png"),
]


def has_content(img, x, y, w, h):
    region = img.crop((x, y, x + w, y + h))
    if region.mode != "RGBA":
        region = region.convert("RGBA")
    extrema = region.getextrema()
    return extrema[3][1] > 10


def process_tileset(name, img_path, firstgid, output_base):
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    cols = w // TILE_SIZE
    rows = h // TILE_SIZE

    out_dir = output_base / name
    out_dir.mkdir(parents=True, exist_ok=True)

    strips = []
    for strip_start in range(0, rows, ROWS_PER_STRIP):
        strip_end = min(strip_start + ROWS_PER_STRIP, rows)
        strip_h = (strip_end - strip_start) * TILE_SIZE

        y_start = strip_start * TILE_SIZE
        strip_img = img.crop((0, y_start, w, y_start + strip_h))

        if not has_content(strip_img, 0, 0, w, strip_h):
            continue

        gid_start = firstgid + strip_start * cols
        gid_end = firstgid + strip_end * cols - 1

        filename = f"rows_{strip_start:02d}-{strip_end - 1:02d}_gid_{gid_start}-{gid_end}.png"
        strip_img.save(out_dir / filename)

        strips.append({
            "file": filename,
            "row_range": [strip_start, strip_end - 1],
            "gid_range": [gid_start, gid_end],
            "cols": cols,
            "furniture": [],
        })

    with open(out_dir / "strips.json", "w") as f:
        json.dump(strips, f, indent=2)

    return strips


def get_firstgids():
    with open(MAP_JSON) as f:
        data = json.load(f)
    result = {}
    for ts in data["tilesets"]:
        source = ts.get("source", ts.get("image", ""))
        stem = Path(source).stem
        result[stem] = ts["firstgid"]
    return result


def get_used_gids():
    with open(MAP_JSON) as f:
        data = json.load(f)
    used = set()
    for layer in data.get("layers", []):
        for gid in layer.get("data", []):
            if gid > 0:
                used.add(gid)
    return used


def main():
    firstgids = get_firstgids()
    used_gids = get_used_gids()
    OUTPUT_DIR.mkdir(exist_ok=True)

    summary = {}
    for name, path in TILESETS:
        if not path.exists():
            print(f"SKIP: {path}")
            continue
        fgid = firstgids.get(name, 1)
        print(f"\n=== {name} (firstgid={fgid}) ===")
        strips = process_tileset(name, path, fgid, OUTPUT_DIR)

        for s in strips:
            gid_lo, gid_hi = s["gid_range"]
            in_use = [g for g in range(gid_lo, gid_hi + 1) if g in used_gids]
            s["used_gid_count"] = len(in_use)
            s["used_gids"] = in_use
            status = f"[{len(in_use)} used]" if in_use else "[unused]"
            print(f"  {s['file']}  {status}")

        summary[name] = {
            "strips": len(strips),
            "firstgid": fgid,
        }

    with open(OUTPUT_DIR / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nDone! Output in {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
