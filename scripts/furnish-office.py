#!/usr/bin/env python3
"""
Modern office furniture layout generator.
Preserves: Ground, GroundVisual, Wall layers.
Redesigns: All furniture/object layers.
"""

import json
import copy
from pathlib import Path

MAP_FILE = Path("client/public/assets/map/map.json")

# Load sprite-to-GID mapping
with open("_tile_catalog/sprite_gid_map.json") as f:
    SPRITE_MAP = json.load(f)

def sprite_gids(sprite_num):
    s = str(sprite_num)
    if s not in SPRITE_MAP:
        return []
    return SPRITE_MAP[s]["gids"]

def sprite_flat_gids(sprite_num):
    gids = sprite_gids(sprite_num)
    return [g for row in gids for g in row if g > 0]

# ---- GID PALETTE (verified from existing map + high-confidence fuzzy matches) ----

# Chairs (from chair.png, firstgid=2561) - 32x64 objects
CHAIR = {
    "down": 2562,
    "right": 2564,
    "up": 2566,
    "left": 2564 | 0x80000000,
    "orange_down": 2568,
    "orange_right": 2570,
    "orange_up": 2572,
}

# Computers (from computer.png, firstgid=4680) - 48x40 objects
COMPUTER = [4680, 4681, 4682, 4683, 4684, 4685]

# Vending machine (firstgid=5489) - 48x72
VENDING = 5489

# From Modern_Office_Black_Shadow (firstgid=2584, 16 cols)
# Partitions (sprite #1-85)
PARTITION_WOOD_3x1 = [2584]  # sprite #1 top
PARTITION_GRAY_3x1 = [2600]  # sprite #2
PARTITION_WOOD_2x1 = [2616]  # sprite #3

# Plants (sprite #97)
PLANT_TALL = [2631, 2647]  # 1x2 tiles (top, bottom)
PLANT_SMALL = 3003  # verified from existing map

# Monitors on desks
MONITOR_FRONT = 2790  # sprite #130 fuzzy
MONITOR_SIDE_R = [2725]  # sprite #121

# Desks (from tileset) - identified from catalog
DESK_WOOD_HORIZ = [2719, 2735]  # sprite #113 (1x2, horizontal desk)
DESK_WOOD_LEFT = [2751, 2767]   # sprite #114
DESK_WOOD_RIGHT = [2752, 2768]  # sprite #115
DESK_WOOD_2x2 = [2720, 2721, 2736, 2737]  # sprite #116
DESK_SMALL = 2724  # sprite #120

# Sofas
SOFA_DARK_2x1 = [2916, 2917]    # sprite #188
SOFA_DARK_CORNER = [2918, 2919]  # sprite #191 (verified from existing FurnitureCollision!)
SOFA_BEIGE_2x1 = [2827, 2843]   # sprite #196

# Cabinets/Storage
CABINET_TALL = [2945, 2993]  # sprite #147
BOOKSHELF = 2825  # sprite #154

# Tables
TABLE_SMALL = 3111  # sprite #244
TABLE_WOOD = [3145, 3146, 3128, 3128]  # sprite #249

# Large desk setups (sprite #301-303)
DESK_SETUP_1 = [3227]  # sprite #301
DESK_SETUP_2 = [3225]  # sprite #302
DESK_SETUP_3 = [3224]  # sprite #303

# Wall decor
PICTURE_FRAME = [2776, 2777, 2792, 2793]  # sprite #164 (2x2)
WALL_SIGN = 2781  # sprite #161
CLOCK = 2797  # sprite #162

# Electronics
PRINTER_AREA = [3077]  # sprite #237
CCTV = [3109]  # sprite #239

# ---- OBJECT BUILDER ----

_next_id = 1000

def make_obj(gid, x, y, w=32, h=32, props=None):
    global _next_id
    _next_id += 1
    obj = {
        "gid": gid,
        "height": h,
        "id": _next_id,
        "name": "",
        "rotation": 0,
        "type": "",
        "visible": True,
        "width": w,
        "x": x,
        "y": y,
    }
    if props:
        obj["properties"] = props
    return obj

def chair(direction, x, y):
    gid = CHAIR[direction]
    props = [{"name": "direction", "type": "string", "value": direction.replace("orange_", "")}]
    return make_obj(gid, x, y, w=32, h=64, props=props)

def computer(x, y, variant=0):
    return make_obj(COMPUTER[variant % 6], x, y, w=48, h=40)

def tile(gid, col, row):
    return make_obj(gid, col * 32, (row + 1) * 32)

# ---- ROOM LAYOUTS ----

def build_room_a():
    """Room A (cols 2-4, rows 3-5): Server/Storage Room"""
    objs_collision = []
    objs_visual = []

    # Cabinets along walls
    objs_collision.append(tile(CABINET_TALL[0], 2, 3))  # top-left cabinet
    objs_collision.append(tile(CABINET_TALL[1], 2, 4))  # bottom part
    objs_collision.append(tile(BOOKSHELF, 3, 3))
    objs_collision.append(tile(BOOKSHELF, 4, 3))
    objs_collision.append(tile(CABINET_TALL[0], 3, 4))
    objs_collision.append(tile(CABINET_TALL[0], 4, 4))

    return objs_collision, objs_visual

def build_room_b():
    """Room B (cols 6-11, rows 3-5): Conference Room"""
    chairs_list = []
    collision = []
    meeting = []

    # Meeting table (4 tiles in center, rows 3-4, cols 7-10)
    for c in range(7, 11):
        meeting.append(tile(3111, c, 4))  # table surface

    # Chairs around table
    for c in [7, 8, 9, 10]:
        chairs_list.append(chair("up", c * 32, 5 * 32 + 64))  # bottom row chairs facing up
    for c in [7, 8, 9, 10]:
        chairs_list.append(chair("down", c * 32, 4 * 32))  # top row chairs facing down

    return collision, meeting, chairs_list

def build_room_c():
    """Room C (cols 13-17, rows 3-5): Executive Office"""
    collision = []
    visual = []
    chairs_list = []
    computers = []
    objects = []

    # L-desk (cols 14-16, row 4)
    collision.append(tile(DESK_WOOD_2x2[0], 14, 3))
    collision.append(tile(DESK_WOOD_2x2[1], 15, 3))
    collision.append(tile(DESK_WOOD_2x2[2], 14, 4))
    collision.append(tile(DESK_WOOD_2x2[3], 15, 4))
    collision.append(tile(DESK_SMALL, 16, 4))

    # Chair
    chairs_list.append(chair("up", 14 * 32, 5 * 32 + 64))

    # Computer on desk
    computers.append(computer(14 * 32 + 8, 4 * 32, 0))

    # Plant in corner
    objects.append(tile(PLANT_SMALL, 17, 3))

    return collision, visual, chairs_list, computers, objects

def build_main_workspace():
    """Main Space (cols 2-17, rows 7-18): Open Workspace with 3 desk clusters"""
    collision = []
    chairs_list = []
    computers = []
    objects = []

    # === Cluster 1 (rows 8-10, cols 3-6 and 8-11) ===
    # Left pod: 3 desks facing down (row 8) + 3 desks facing up (row 10)
    for c in [3, 4, 5]:
        collision.append(tile(DESK_WOOD_2x2[0], c, 8))
        collision.append(tile(DESK_WOOD_2x2[2], c, 9))
        computers.append(computer(c * 32 - 8, 9 * 32, c % 6))
        chairs_list.append(chair("down", c * 32, 8 * 32))

    for c in [3, 4, 5]:
        collision.append(tile(DESK_WOOD_2x2[1], c, 10))
        collision.append(tile(DESK_WOOD_2x2[3], c, 11))
        computers.append(computer(c * 32 - 8, 11 * 32, (c + 3) % 6))
        chairs_list.append(chair("up", c * 32, 12 * 32 + 64))

    # Right pod: same layout at cols 9-11
    for c in [9, 10, 11]:
        collision.append(tile(DESK_WOOD_2x2[0], c, 8))
        collision.append(tile(DESK_WOOD_2x2[2], c, 9))
        computers.append(computer(c * 32 - 8, 9 * 32, c % 6))
        chairs_list.append(chair("down", c * 32, 8 * 32))

    for c in [9, 10, 11]:
        collision.append(tile(DESK_WOOD_2x2[1], c, 10))
        collision.append(tile(DESK_WOOD_2x2[3], c, 11))
        computers.append(computer(c * 32 - 8, 11 * 32, (c + 3) % 6))
        chairs_list.append(chair("up", c * 32, 12 * 32 + 64))

    # Partition between pods (col 7)
    collision.append(tile(PARTITION_WOOD_3x1[0], 7, 8))
    collision.append(tile(PARTITION_GRAY_3x1[0], 7, 9))
    collision.append(tile(PARTITION_WOOD_3x1[0], 7, 10))

    # === Cluster 2 (rows 13-16, cols 3-6 and 9-11) ===
    for c in [3, 4, 5]:
        collision.append(tile(DESK_WOOD_2x2[0], c, 13))
        collision.append(tile(DESK_WOOD_2x2[2], c, 14))
        computers.append(computer(c * 32 - 8, 14 * 32, c % 6))
        chairs_list.append(chair("down", c * 32, 13 * 32))

    for c in [3, 4, 5]:
        collision.append(tile(DESK_WOOD_2x2[1], c, 15))
        collision.append(tile(DESK_WOOD_2x2[3], c, 16))
        computers.append(computer(c * 32 - 8, 16 * 32, (c + 1) % 6))
        chairs_list.append(chair("up", c * 32, 17 * 32 + 64))

    for c in [9, 10, 11]:
        collision.append(tile(DESK_WOOD_2x2[0], c, 13))
        collision.append(tile(DESK_WOOD_2x2[2], c, 14))
        computers.append(computer(c * 32 - 8, 14 * 32, c % 6))
        chairs_list.append(chair("down", c * 32, 13 * 32))

    for c in [9, 10, 11]:
        collision.append(tile(DESK_WOOD_2x2[1], c, 15))
        collision.append(tile(DESK_WOOD_2x2[3], c, 16))
        computers.append(computer(c * 32 - 8, 16 * 32, (c + 2) % 6))
        chairs_list.append(chair("up", c * 32, 17 * 32 + 64))

    # Partition between cluster 2 pods
    collision.append(tile(PARTITION_WOOD_3x1[0], 7, 13))
    collision.append(tile(PARTITION_GRAY_3x1[0], 7, 14))
    collision.append(tile(PARTITION_WOOD_3x1[0], 7, 15))

    # === Side furniture ===
    # Manager desk at right wall (cols 14-16, rows 8-9)
    collision.append(tile(DESK_WOOD_2x2[0], 14, 8))
    collision.append(tile(DESK_WOOD_2x2[1], 15, 8))
    collision.append(tile(DESK_WOOD_2x2[2], 14, 9))
    collision.append(tile(DESK_WOOD_2x2[3], 15, 9))
    computers.append(computer(14 * 32 - 8, 9 * 32, 2))
    chairs_list.append(chair("up", 14 * 32, 10 * 32 + 64))

    # Plants in corners
    objects.append(tile(PLANT_SMALL, 2, 7))
    objects.append(tile(PLANT_SMALL, 17, 7))
    objects.append(tile(PLANT_SMALL, 2, 18))
    objects.append(tile(PLANT_SMALL, 17, 18))

    # Printer area (right side, row 14)
    collision.append(tile(PRINTER_AREA[0], 16, 14))
    collision.append(tile(PRINTER_AREA[0], 17, 14))

    return collision, chairs_list, computers, objects

def build_breakroom():
    """Room D-Left (cols 2-9, rows 20-21): Break Room"""
    collision = []
    objects = []
    chairs_list = []

    # Sofa (cols 3-4, row 20)
    collision.append(tile(SOFA_DARK_2x1[0], 3, 20))
    collision.append(tile(SOFA_DARK_2x1[1], 4, 20))

    # Coffee table
    collision.append(tile(TABLE_SMALL, 3, 21))
    collision.append(tile(TABLE_SMALL, 4, 21))

    # Another sofa set
    collision.append(tile(SOFA_DARK_CORNER[0], 7, 20))
    collision.append(tile(SOFA_DARK_CORNER[1], 8, 20))

    # Plants
    objects.append(tile(PLANT_SMALL, 2, 20))
    objects.append(tile(PLANT_SMALL, 9, 20))

    return collision, chairs_list, objects

def build_small_meeting():
    """Room D-Right (cols 12-17, rows 20-21): Small Meeting Room"""
    collision = []
    meeting = []
    chairs_list = []

    # Small table
    collision.append(tile(TABLE_SMALL, 14, 20))
    collision.append(tile(TABLE_SMALL, 15, 20))

    # Chairs
    chairs_list.append(chair("up", 14 * 32, 21 * 32 + 64))
    chairs_list.append(chair("up", 15 * 32, 21 * 32 + 64))
    chairs_list.append(chair("down", 14 * 32, 20 * 32))
    chairs_list.append(chair("down", 15 * 32, 20 * 32))

    return collision, meeting, chairs_list

def build_lower_left():
    """Lower-left rooms (cols 2-5, rows 24-30): Team Room + Storage"""
    collision = []
    chairs_list = []
    computers = []
    objects = []

    # Team desks (cols 2-4, rows 24-26)
    for c in [2, 3, 4]:
        collision.append(tile(DESK_SMALL, c, 24))
        computers.append(computer(c * 32 - 8, 25 * 32, c % 6))
        chairs_list.append(chair("up", c * 32, 26 * 32 + 64))

    # Storage cabinets (rows 28-30)
    for c in [2, 3, 4]:
        collision.append(tile(BOOKSHELF, c, 29))

    objects.append(tile(PLANT_SMALL, 2, 28))

    return collision, chairs_list, computers, objects

def build_lower_right():
    """Lower-right area (cols 12-17, rows 24-30): Lounge + Library"""
    collision = []
    chairs_list = []
    objects = []

    # Bookshelves along wall (row 24)
    for c in [14, 15, 16]:
        collision.append(tile(BOOKSHELF, c, 24))

    # Sofa lounge area (rows 25-26)
    collision.append(tile(SOFA_BEIGE_2x1[0], 13, 26))
    collision.append(tile(SOFA_BEIGE_2x1[1], 14, 26))

    # Small table
    collision.append(tile(TABLE_SMALL, 15, 26))

    # Chairs
    chairs_list.append(chair("right", 12 * 32, 26 * 32 + 64))
    chairs_list.append(chair("down", 15 * 32, 26 * 32))

    objects.append(tile(PLANT_SMALL, 17, 24))
    objects.append(tile(PLANT_SMALL, 12, 29))

    return collision, chairs_list, objects

def build_corridor_decor():
    """Corridor and common area decorations"""
    objects = []
    collision = []

    # Vending machine near break room
    collision.append(make_obj(VENDING, 9 * 32, 22 * 32, w=48, h=72))

    # Plants in corridors
    objects.append(tile(PLANT_SMALL, 7, 19))
    objects.append(tile(PLANT_SMALL, 10, 19))

    return collision, objects

# ---- MAIN ----

def main():
    with open(MAP_FILE) as f:
        data = json.load(f)

    # Build all room furniture
    room_a_col, room_a_vis = build_room_a()
    room_b_col, room_b_meet, room_b_chairs = build_room_b()
    room_c_col, room_c_vis, room_c_chairs, room_c_comp, room_c_obj = build_room_c()
    main_col, main_chairs, main_comp, main_obj = build_main_workspace()
    break_col, break_chairs, break_obj = build_breakroom()
    smeet_col, smeet_meet, smeet_chairs = build_small_meeting()
    ll_col, ll_chairs, ll_comp, ll_obj = build_lower_left()
    lr_col, lr_chairs, lr_obj = build_lower_right()
    corr_col, corr_obj = build_corridor_decor()

    # Aggregate by layer
    all_collision = room_a_col + room_b_col + room_c_col + main_col + break_col + smeet_col + ll_col + lr_col + corr_col
    all_meeting = room_b_meet + smeet_meet
    all_chairs = room_b_chairs + room_c_chairs + main_chairs + break_chairs + smeet_chairs + ll_chairs + lr_chairs
    all_computers = room_c_comp + main_comp + ll_comp
    all_objects = room_c_obj + main_obj + break_obj + ll_obj + lr_obj + corr_obj

    print(f"Furniture: {len(all_collision)} collision, {len(all_meeting)} meeting, {len(all_chairs)} chairs, {len(all_computers)} computers, {len(all_objects)} objects")

    # Update layers
    layer_map = {
        "FurnitureCollision": all_collision,
        "MeetingVisuals": all_meeting,
        "Chair": all_chairs,
        "Computer": all_computers,
        "Objects": all_objects,
        "ObjectsOnCollide": [],
        "GenericObjects": [],
        "GenericObjectsOnCollide": [],
        "DeskVisuals": [],
        "Whiteboard": [],
        "Basement": [],
        "VendingMachine": [],
    }

    # Preserve: Ground, GroundVisual, Wall, WallDecor, OfficeAddons, OfficeAddonsOnCollide
    preserve = {"Ground", "GroundVisual", "Wall", "WallDecor", "OfficeAddons", "OfficeAddonsOnCollide"}

    for layer in data["layers"]:
        name = layer.get("name", "")
        if name in preserve:
            continue
        if name in layer_map:
            layer["objects"] = layer_map[name]
            print(f"  Updated {name}: {len(layer_map[name])} objects")

    # Save
    with open(MAP_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nSaved to {MAP_FILE}")
    print(f"Total objects placed: {sum(len(v) for v in layer_map.values())}")

if __name__ == "__main__":
    main()
