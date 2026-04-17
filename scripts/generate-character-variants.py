#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import colorsys

ROOT = Path(__file__).resolve().parents[1]
CHAR_DIR = ROOT / 'client/public/assets/character'
LOGIN_DIR = ROOT / 'client/src/images/login'

VARIANTS = [
    ('adam_navy', 'adam', 0.58, 1.05, 0.95),
    ('adam_sand', 'adam', 0.11, 0.75, 1.08),
    ('ash_charcoal', 'ash', 0.0, 0.18, 0.92),
    ('ash_mint', 'ash', 0.42, 0.85, 1.05),
    ('lucy_rose', 'lucy', 0.93, 0.9, 1.05),
    ('lucy_indigo', 'lucy', 0.66, 1.0, 0.98),
    ('nancy_gold', 'nancy', 0.13, 1.0, 1.08),
    ('nancy_teal', 'nancy', 0.50, 0.95, 1.0),
]


def is_skin(r, g, b):
    return r > 150 and g > 105 and b > 85 and r > b and abs(r - g) < 85


def is_outline(r, g, b):
    return r < 40 and g < 40 and b < 55


def recolor(img: Image.Image, hue_shift: float, sat_mult: float, val_mult: float):
    out = Image.new('RGBA', img.size)
    src = img.convert('RGBA')
    pixels = src.load()
    target = out.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                target[x, y] = (0, 0, 0, 0)
                continue
            if is_skin(r, g, b) or is_outline(r, g, b):
                target[x, y] = (r, g, b, a)
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s < 0.08:
                target[x, y] = (r, g, b, a)
                continue
            h = (h + hue_shift) % 1.0
            s = min(1.0, max(0.0, s * sat_mult))
            v = min(1.0, max(0.0, v * val_mult))
            nr, ng, nb = colorsys.hsv_to_rgb(h, s, v)
            target[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    return out


for output_name, base_name, hue_shift, sat_mult, val_mult in VARIANTS:
    base_sprite = Image.open(CHAR_DIR / f'{base_name}.png')
    base_login = Image.open(LOGIN_DIR / f'{base_name.capitalize()}_login.png')
    recolor(base_sprite, hue_shift, sat_mult, val_mult).save(CHAR_DIR / f'{output_name}.png')
    recolor(base_login, hue_shift, sat_mult, val_mult).save(LOGIN_DIR / f'{output_name}.png')
    print(output_name)
