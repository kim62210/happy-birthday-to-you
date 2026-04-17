#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'client/public/assets/items/computer.png'

FRAME_W = 48
FRAME_H = 40
FRAMES = 6

img = Image.new('RGBA', (FRAME_W * FRAMES, FRAME_H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img, 'RGBA')


def monitor_cluster(frame: int, accent: tuple[int, int, int, int], screens: int):
    ox = frame * FRAME_W

    # soft desk shadow
    draw.ellipse((ox + 9, 27, ox + 39, 35), fill=(18, 22, 29, 70))

    # base strip
    draw.rectangle((ox + 10, 26, ox + 38, 29), fill=(82, 88, 99, 230))

    left = 6
    gap = 2
    monitor_w = 10 if screens == 3 else 14
    cluster_w = screens * monitor_w + (screens - 1) * gap
    start_x = ox + (FRAME_W - cluster_w) // 2

    for index in range(screens):
        x1 = start_x + index * (monitor_w + gap)
        y1 = 8 + (index % 2)
        x2 = x1 + monitor_w
        y2 = y1 + 11
        draw.rounded_rectangle((x1, y1, x2, y2), radius=1, fill=(45, 50, 57, 255))
        draw.rectangle((x1 + 1, y1 + 1, x2 - 1, y2 - 2), fill=(86, 152, 213, 255))
        draw.line((x1 + 2, y1 + 3, x2 - 2, y1 + 3), fill=(208, 236, 255, 170))
        draw.rectangle((x1 + 3, y1 + 5, x1 + 5, y1 + 7), fill=accent)
        draw.rectangle((x1 + 6, y1 + 6, x2 - 3, y1 + 7), fill=(188, 217, 245, 180))
        # stand
        cx = (x1 + x2) // 2
        draw.rectangle((cx - 1, y2 - 1, cx + 1, 21), fill=(94, 100, 112, 255))
        draw.rectangle((cx - 4, 21, cx + 4, 23), fill=(101, 108, 122, 255))

    # keyboard / dock
    draw.rounded_rectangle((ox + 13, 24, ox + 35, 27), radius=1, fill=(224, 229, 234, 220))
    draw.line((ox + 15, 25, ox + 33, 25), fill=(141, 148, 156, 180))


variants = [
    ((228, 102, 91, 255), 2),
    ((245, 212, 91, 255), 3),
    ((125, 187, 126, 255), 2),
    ((228, 102, 91, 255), 3),
    ((208, 208, 208, 255), 2),
    ((160, 204, 255, 255), 3),
]

for frame, (accent, screens) in enumerate(variants):
    monitor_cluster(frame, accent, screens)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUTPUT)
print(OUTPUT)
