#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'client/public/assets/tileset/Modern_Office_Addons.png'
TILE = 32
COLS = 16
ROWS = 5


def load_font(size: int):
    candidates = [
        '/System/Library/Fonts/AppleSDGothicNeo.ttc',
        '/System/Library/Fonts/Supplemental/AppleGothic.ttf',
        '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    ]
    for path in candidates:
      p = Path(path)
      if p.exists():
        try:
          return ImageFont.truetype(str(p), size)
        except Exception:
          continue
    return ImageFont.load_default()


font_small = load_font(11)
font_tiny = load_font(9)

img = Image.new('RGBA', (COLS * TILE, ROWS * TILE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img, 'RGBA')


def tile_origin(index: int):
    return (index % COLS) * TILE, (index // COLS) * TILE


def with_tile(index: int, fn):
    ox, oy = tile_origin(index)
    fn(ox, oy)


def rect(ox, oy, x1, y1, x2, y2, fill, outline=None, width=1):
    draw.rectangle((ox + x1, oy + y1, ox + x2, oy + y2), fill=fill, outline=outline, width=width)


def line(ox, oy, x1, y1, x2, y2, fill, width=1):
    draw.line((ox + x1, oy + y1, ox + x2, oy + y2), fill=fill, width=width)


def glass_panel_horizontal(index: int, window=False, door=False):
    def inner(ox, oy):
        frame = (112, 126, 140, 255) if not window else (136, 144, 154, 255)
        fill = (170, 228, 252, 165) if not window else (232, 243, 248, 150)
        top, bottom = (10, 22) if door else (11, 21)
        rect(ox, oy, 2, top, 29, bottom, fill, frame, 1)
        line(ox, oy, 2, top, 29, top, (243, 250, 255, 220))
        line(ox, oy, 2, bottom, 29, bottom, (70, 89, 106, 200))
        line(ox, oy, 15, top + 1, 15, bottom - 1, (238, 249, 255, 140))
        rect(ox, oy, 4, 15, 27, 17, (230, 242, 246, 165))
        line(ox, oy, 6, 12, 10, 19, (255, 255, 255, 100))
        if door:
            rect(ox, oy, 23, 14, 25, 17, (221, 230, 238, 255))
    with_tile(index, inner)


def glass_panel_vertical(index: int, window=False, door=False):
    def inner(ox, oy):
        frame = (112, 126, 140, 255) if not window else (136, 144, 154, 255)
        fill = (170, 228, 252, 165) if not window else (232, 243, 248, 150)
        left, right = (10, 22) if door else (11, 21)
        rect(ox, oy, left, 2, right, 29, fill, frame, 1)
        line(ox, oy, left, 2, left, 29, (243, 250, 255, 220))
        line(ox, oy, right, 2, right, 29, (70, 89, 106, 200))
        line(ox, oy, left + 1, 15, right - 1, 15, (238, 249, 255, 140))
        rect(ox, oy, 15, 4, 17, 27, (230, 242, 246, 165))
        line(ox, oy, 12, 6, 19, 10, (255, 255, 255, 100))
        if door:
            rect(ox, oy, 14, 22, 17, 24, (221, 230, 238, 255))
    with_tile(index, inner)


def partition_horizontal(index: int):
    def inner(ox, oy):
        rect(ox, oy, 2, 12, 29, 20, (122, 128, 139, 255), (77, 82, 92, 255), 1)
        line(ox, oy, 3, 13, 28, 13, (188, 193, 201, 255))
        line(ox, oy, 3, 19, 28, 19, (62, 67, 77, 255))
    with_tile(index, inner)


def partition_vertical(index: int):
    def inner(ox, oy):
        rect(ox, oy, 12, 2, 20, 29, (122, 128, 139, 255), (77, 82, 92, 255), 1)
        line(ox, oy, 13, 3, 13, 28, (188, 193, 201, 255))
        line(ox, oy, 19, 3, 19, 28, (62, 67, 77, 255))
    with_tile(index, inner)


def kitchen_counter(index: int, variant: str):
    def inner(ox, oy):
        # top
        rect(ox, oy, 1, 5, 30, 11, (213, 197, 176, 255), (149, 131, 111, 255), 1)
        line(ox, oy, 2, 6, 29, 6, (235, 221, 204, 255))
        # cabinet body
        rect(ox, oy, 2, 12, 29, 28, (186, 92, 82, 255), (113, 50, 45, 255), 1)
        line(ox, oy, 2, 21, 29, 21, (126, 60, 54, 255))
        line(ox, oy, 15, 12, 15, 28, (126, 60, 54, 255))
        rect(ox, oy, 8, 18, 10, 19, (230, 213, 195, 255))
        rect(ox, oy, 20, 18, 22, 19, (230, 213, 195, 255))

        if variant == 'left':
            line(ox, oy, 1, 12, 1, 28, (213, 192, 173, 255), 1)
        elif variant == 'right':
            line(ox, oy, 30, 12, 30, 28, (213, 192, 173, 255), 1)
        elif variant == 'coffee':
            rect(ox, oy, 6, 2, 17, 10, (55, 53, 53, 255), (25, 24, 24, 255), 1)
            rect(ox, oy, 9, 5, 14, 8, (198, 80, 70, 255))
            rect(ox, oy, 19, 6, 21, 10, (228, 224, 218, 255))
            rect(ox, oy, 23, 6, 25, 10, (228, 224, 218, 255))
        elif variant == 'snack':
            rect(ox, oy, 6, 3, 26, 10, (169, 143, 108, 255), (116, 94, 67, 255), 1)
            rect(ox, oy, 8, 5, 11, 8, (245, 211, 80, 255))
            rect(ox, oy, 13, 4, 17, 8, (233, 112, 86, 255))
            rect(ox, oy, 19, 5, 24, 8, (123, 177, 116, 255))
        elif variant == 'storage':
            rect(ox, oy, 7, 3, 25, 10, (208, 200, 193, 255), (128, 120, 114, 255), 1)
            rect(ox, oy, 10, 6, 22, 8, (112, 108, 104, 255))
        elif variant == 'fridge':
            rect(ox, oy, 7, 2, 23, 29, (215, 219, 224, 255), (134, 140, 148, 255), 1)
            line(ox, oy, 7, 14, 23, 14, (171, 176, 183, 255))
            rect(ox, oy, 20, 7, 21, 12, (115, 120, 126, 255))
            rect(ox, oy, 20, 18, 21, 23, (115, 120, 126, 255))
            rect(ox, oy, 9, 5, 12, 8, (203, 88, 78, 255))
        elif variant == 'locker':
            rect(ox, oy, 5, 2, 25, 29, (182, 87, 80, 255), (108, 51, 48, 255), 1)
            line(ox, oy, 5, 15, 25, 15, (127, 60, 57, 255))
            rect(ox, oy, 14, 8, 15, 10, (236, 220, 201, 255))
            rect(ox, oy, 14, 20, 15, 22, (236, 220, 201, 255))
    with_tile(index, inner)


def signage(index: int, label: str, accent):
    def inner(ox, oy):
        rect(ox, oy, 5, 10, 26, 21, (223, 214, 200, 255), (135, 120, 101, 255), 1)
        draw.text((ox + 7, oy + 11), label, font=font_tiny, fill=accent)
    with_tile(index, inner)


def plant(index: int):
    def inner(ox, oy):
        rect(ox, oy, 12, 20, 19, 27, (176, 153, 130, 255), (113, 93, 75, 255), 1)
        rect(ox, oy, 10, 17, 21, 20, (105, 86, 69, 255))
        rect(ox, oy, 12, 8, 15, 19, (77, 133, 83, 255))
        rect(ox, oy, 16, 5, 18, 19, (91, 152, 95, 255))
        rect(ox, oy, 8, 10, 11, 18, (92, 146, 96, 255))
        rect(ox, oy, 18, 10, 21, 17, (68, 121, 74, 255))
    with_tile(index, inner)


def mat(index: int):
    def inner(ox, oy):
        rect(ox, oy, 3, 10, 28, 23, (148, 55, 52, 255), (205, 176, 159, 255), 1)
        rect(ox, oy, 7, 13, 24, 20, (171, 76, 68, 255))
    with_tile(index, inner)


def cups(index: int):
    def inner(ox, oy):
        rect(ox, oy, 5, 7, 26, 24, (208, 197, 182, 255), (145, 127, 109, 255), 1)
        rect(ox, oy, 8, 12, 11, 18, (228, 222, 216, 255))
        rect(ox, oy, 14, 12, 17, 18, (228, 222, 216, 255))
        rect(ox, oy, 20, 12, 23, 18, (228, 222, 216, 255))
        line(ox, oy, 7, 22, 24, 22, (165, 145, 120, 255))
    with_tile(index, inner)


def wall_mask_tile(index: int, mask: int):
    def inner(ox, oy):
        wall_fill = (247, 245, 241, 255)
        border = (70, 73, 86, 255)
        shadow = (216, 196, 162, 255)
        draw.rectangle((ox, oy, ox + 31, oy + 31), fill=wall_fill)
        if mask & 1:  # top
            draw.line((ox, oy, ox + 31, oy), fill=border, width=2)
            draw.line((ox, oy + 2, ox + 31, oy + 2), fill=(232, 231, 227, 255), width=1)
        if mask & 2:  # bottom
            draw.line((ox, oy + 28, ox + 31, oy + 28), fill=shadow, width=2)
            draw.line((ox, oy + 30, ox + 31, oy + 30), fill=border, width=1)
        if mask & 4:  # left
            draw.line((ox, oy, ox, oy + 31), fill=border, width=2)
        if mask & 8:  # right
            draw.line((ox + 31, oy, ox + 31, oy + 31), fill=border, width=2)
    with_tile(index, inner)


def desk_surface(index: int, role: str, bottom: bool = False):
    def inner(ox, oy):
        top_y = 12 if not bottom else 10
        bottom_y = 23 if not bottom else 21
        top_color = (227, 211, 190, 255)
        top_shadow = (190, 173, 153, 255)
        frame = (76, 74, 86, 255)
        leg = (90, 96, 108, 255)

        # surface profile
        if role.endswith('L'):
            left, right = 2, 31
        elif role.endswith('R'):
            left, right = 0, 29
        else:
            left, right = 0, 31
        rect(ox, oy, left, top_y, right, top_y + 4, top_color, frame, 1)
        rect(ox, oy, left, top_y + 5, right, top_y + 7, top_shadow)
        line(ox, oy, left + 1, top_y + 1, right - 1, top_y + 1, (244, 237, 227, 255))
        line(ox, oy, left + 1, top_y + 7, right - 1, top_y + 7, frame)

        # frame / modesty panel
        panel_top = top_y + 8
        panel_bottom = max(panel_top + 1, bottom_y - 2)
        rect(ox, oy, left + 1, panel_top, right - 1, panel_bottom, (77, 73, 87, 255))
        rect(ox, oy, left + 2, panel_top + 1, right - 2, max(panel_top + 1, panel_bottom - 1), (105, 102, 118, 255))

        # legs
        for lx in (left + 3, right - 4):
            rect(ox, oy, lx, bottom_y - 2, lx + 1, 29, leg)

        # monitor cluster
        mon_y = top_y - 8 if not bottom else top_y + 2
        base_y = mon_y + 10
        if role.startswith('desk3'):
            centers = [8, 16, 24]
            active = [1] if role.endswith('M') else ([0] if role.endswith('L') else [2])
        elif role.startswith('desk2'):
            centers = [11, 21]
            active = [0] if role.endswith('L') else [1]
        else:
            centers = [16]
            active = [0]

        for idx in active:
            cx = centers[idx]
            rect(ox, oy, cx - 5, mon_y, cx + 5, mon_y + 7, (48, 54, 62, 255), (25, 28, 33, 255), 1)
            rect(ox, oy, cx - 4, mon_y + 1, cx + 4, mon_y + 5, (88, 158, 220, 255))
            line(ox, oy, cx - 4, mon_y + 2, cx + 4, mon_y + 2, (219, 241, 255, 160))
            rect(ox, oy, cx - 1, mon_y + 8, cx + 1, base_y, (95, 101, 110, 255))
            rect(ox, oy, cx - 5, base_y, cx + 5, base_y + 1, (118, 125, 136, 255))
            rect(ox, oy, cx - 7, base_y + 2, cx + 7, base_y + 3, (212, 216, 221, 220))
    with_tile(index, inner)


def meeting_table(index: int, role: str, bottom: bool = False):
    def inner(ox, oy):
        top_y = 10 if not bottom else 14
        bottom_y = 23 if not bottom else 27
        surface = (212, 190, 167, 255)
        edge = (174, 151, 129, 255)
        frame = (79, 77, 89, 255)

        if role.endswith('L'):
            left, right = 2, 31
        elif role.endswith('R'):
            left, right = 0, 29
        else:
            left, right = 0, 31
        rect(ox, oy, left, top_y, right, top_y + 5, surface, frame, 1)
        line(ox, oy, left + 1, top_y + 1, right - 1, top_y + 1, (238, 226, 212, 255))
        rect(ox, oy, left, top_y + 6, right, top_y + 8, edge)
        for lx in (left + 3, right - 4):
            rect(ox, oy, lx, top_y + 9, lx + 1, bottom_y, (94, 100, 111, 255))
    with_tile(index, inner)


def realistic_door(index: int, vertical: bool):
    def inner(ox, oy):
        frame = (109, 119, 131, 255)
        panel = (219, 235, 244, 170)
        wood = (160, 132, 106, 255)
        if vertical:
            rect(ox, oy, 10, 1, 21, 30, panel, frame, 1)
            rect(ox, oy, 9, 0, 22, 2, wood)
            rect(ox, oy, 9, 29, 22, 31, wood)
            line(ox, oy, 12, 4, 19, 11, (255, 255, 255, 110))
            rect(ox, oy, 19, 15, 20, 17, (214, 220, 224, 255))
        else:
            rect(ox, oy, 1, 10, 30, 21, panel, frame, 1)
            rect(ox, oy, 0, 9, 2, 22, wood)
            rect(ox, oy, 29, 9, 31, 22, wood)
            line(ox, oy, 4, 12, 11, 19, (255, 255, 255, 110))
            rect(ox, oy, 15, 19, 17, 20, (214, 220, 224, 255))
    with_tile(index, inner)


glass_panel_horizontal(0)
glass_panel_vertical(1)
glass_panel_horizontal(2, window=True)
glass_panel_vertical(3, window=True)
partition_horizontal(4)
partition_vertical(5)
glass_panel_horizontal(6, door=True)
glass_panel_vertical(7, door=True)

kitchen_counter(8, 'left')
kitchen_counter(9, 'snack')
kitchen_counter(10, 'right')
kitchen_counter(11, 'coffee')
kitchen_counter(12, 'storage')
kitchen_counter(13, 'fridge')
kitchen_counter(14, 'locker')
kitchen_counter(15, 'left')
signage(16, '탕비', (143, 57, 51, 255))
signage(17, '회의', (96, 114, 129, 255))
plant(18)
mat(19)
signage(20, '창', (110, 124, 139, 255))
signage(21, '라운지', (143, 57, 51, 255))
cups(22)
kitchen_counter(23, 'coffee')
kitchen_counter(24, 'snack')
kitchen_counter(25, 'storage')
kitchen_counter(26, 'right')
kitchen_counter(27, 'fridge')
kitchen_counter(28, 'locker')
plant(29)
mat(30)
cups(31)

for mask in range(16):
    wall_mask_tile(32 + mask, mask)

desk_surface(48, 'desk3L', bottom=False)
desk_surface(49, 'desk3M', bottom=False)
desk_surface(50, 'desk3R', bottom=False)
desk_surface(51, 'desk2L', bottom=False)
desk_surface(52, 'desk2R', bottom=False)
desk_surface(53, 'desk1M', bottom=False)
desk_surface(54, 'desk3L', bottom=True)
desk_surface(55, 'desk3M', bottom=True)
desk_surface(56, 'desk3R', bottom=True)
desk_surface(57, 'desk2L', bottom=True)
desk_surface(58, 'desk2R', bottom=True)
desk_surface(59, 'desk1M', bottom=True)

meeting_table(60, 'table1', bottom=False)
meeting_table(61, 'table2L', bottom=False)
meeting_table(62, 'table2R', bottom=False)
meeting_table(63, 'table3L', bottom=False)
meeting_table(64, 'table3M', bottom=False)
meeting_table(65, 'table3R', bottom=False)
meeting_table(66, 'table1', bottom=True)
meeting_table(67, 'table2L', bottom=True)
meeting_table(68, 'table2R', bottom=True)
meeting_table(69, 'table3L', bottom=True)
meeting_table(70, 'table3M', bottom=True)
meeting_table(71, 'table3R', bottom=True)
realistic_door(72, vertical=True)
realistic_door(73, vertical=False)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUTPUT)
print(OUTPUT)
