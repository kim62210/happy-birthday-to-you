#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const HTML_PATH = path.join(PROJECT_ROOT, "map-preview.html");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "client/public/assets/map/map.json");

const TILE = 32;

const FIRSTGID = {
  FloorAndGround: 1,
  chair: 2561,
  ModernOffice: 2584,
  Generic: 3432,
  computer: 4680,
  whiteboard: 4686,
  Basement: 4689,
  vendingmachine: 5489,
  OfficeAddons: 5490,
  ArchiveOffice: 5570,
  ArchiveFloors: 5794,
};

// --- Ground tiles (FloorAndGround) ---
const FLOOR_OFFICE = 415;
const FLOOR_MEETING = 479;
const FLOOR_KITCHEN = 455;
const FLOOR_EMPTY = 0;
const FLOOR_VISUAL_OFFICE = FIRSTGID.ArchiveOffice + 110;
const FLOOR_VISUAL_MEETING = FIRSTGID.Generic + 1;
const FLOOR_VISUAL_KITCHEN = FIRSTGID.ArchiveFloors + 493;

// Core office furniture
const DESK_H = [2617, 2618, 2619];
const DESK_SIDE_W = 2630;
const DESK_SIDE_E = 2630;

// Meeting table 2x2
const TABLE_TL = 2918, TABLE_TR = 2919, TABLE_BL = 2934, TABLE_BR = 2935;

// Chair (chair tileset) - rotate through several visually compatible variants
const CHAIR = {
  down: [2561, 2562, 2565, 2571, 2572],
  left: [2563, 2570],
  right: [2564, 2569],
  up: [2561, 2562, 2566, 2571, 2572],
};

// Computer (96x64)
const COMPUTERS = [4680, 4681, 4682, 4683, 4684, 4685];
const WHITEBOARDS = [4686, 4687, 4688];
let compIdx = 0;
let whiteboardIdx = 0;

// Other
const PLANT = 3003;
const PRINTER_L = 2815;

// Custom addon tileset
const ADDON = {
  GLASS_H: FIRSTGID.OfficeAddons + 0,
  GLASS_V: FIRSTGID.OfficeAddons + 1,
  WINDOW_H: FIRSTGID.OfficeAddons + 2,
  WINDOW_V: FIRSTGID.OfficeAddons + 3,
  PARTITION_H: FIRSTGID.OfficeAddons + 4,
  PARTITION_V: FIRSTGID.OfficeAddons + 5,
  GLASS_DOOR_H: FIRSTGID.OfficeAddons + 6,
  GLASS_DOOR_V: FIRSTGID.OfficeAddons + 7,
  KITCHEN_LEFT: FIRSTGID.OfficeAddons + 8,
  KITCHEN_SNACK: FIRSTGID.OfficeAddons + 9,
  KITCHEN_RIGHT: FIRSTGID.OfficeAddons + 10,
  KITCHEN_COFFEE: FIRSTGID.OfficeAddons + 11,
  KITCHEN_STORAGE: FIRSTGID.OfficeAddons + 12,
  FRIDGE: FIRSTGID.OfficeAddons + 13,
  LOCKER: FIRSTGID.OfficeAddons + 14,
  KITCHEN_FILL: FIRSTGID.OfficeAddons + 15,
  SIGN_KITCHEN: FIRSTGID.OfficeAddons + 16,
  SIGN_MEETING: FIRSTGID.OfficeAddons + 17,
  ACCENT_PLANT: FIRSTGID.OfficeAddons + 18,
  RED_MAT: FIRSTGID.OfficeAddons + 19,
  SIGN_WINDOW: FIRSTGID.OfficeAddons + 20,
  SIGN_LOUNGE: FIRSTGID.OfficeAddons + 21,
  CUPS: FIRSTGID.OfficeAddons + 22,
  KITCHEN_COFFEE_ALT: FIRSTGID.OfficeAddons + 23,
  KITCHEN_SNACK_ALT: FIRSTGID.OfficeAddons + 24,
  KITCHEN_STORAGE_ALT: FIRSTGID.OfficeAddons + 25,
  KITCHEN_RIGHT_ALT: FIRSTGID.OfficeAddons + 26,
  FRIDGE_ALT: FIRSTGID.OfficeAddons + 27,
  LOCKER_ALT: FIRSTGID.OfficeAddons + 28,
  PLANT_ALT: FIRSTGID.OfficeAddons + 29,
  RED_MAT_ALT: FIRSTGID.OfficeAddons + 30,
  CUPS_ALT: FIRSTGID.OfficeAddons + 31,
  WALL_MASK_BASE: FIRSTGID.OfficeAddons + 32,
  DESK3_L_TOP: FIRSTGID.OfficeAddons + 48,
  DESK3_M_TOP: FIRSTGID.OfficeAddons + 49,
  DESK3_R_TOP: FIRSTGID.OfficeAddons + 50,
  DESK2_L_TOP: FIRSTGID.OfficeAddons + 51,
  DESK2_R_TOP: FIRSTGID.OfficeAddons + 52,
  DESK1_TOP: FIRSTGID.OfficeAddons + 53,
  DESK3_L_BOTTOM: FIRSTGID.OfficeAddons + 54,
  DESK3_M_BOTTOM: FIRSTGID.OfficeAddons + 55,
  DESK3_R_BOTTOM: FIRSTGID.OfficeAddons + 56,
  DESK2_L_BOTTOM: FIRSTGID.OfficeAddons + 57,
  DESK2_R_BOTTOM: FIRSTGID.OfficeAddons + 58,
  DESK1_BOTTOM: FIRSTGID.OfficeAddons + 59,
  TABLE1_TOP: FIRSTGID.OfficeAddons + 60,
  TABLE2_L_TOP: FIRSTGID.OfficeAddons + 61,
  TABLE2_R_TOP: FIRSTGID.OfficeAddons + 62,
  TABLE3_L_TOP: FIRSTGID.OfficeAddons + 63,
  TABLE3_M_TOP: FIRSTGID.OfficeAddons + 64,
  TABLE3_R_TOP: FIRSTGID.OfficeAddons + 65,
  TABLE1_BOTTOM: FIRSTGID.OfficeAddons + 66,
  TABLE2_L_BOTTOM: FIRSTGID.OfficeAddons + 67,
  TABLE2_R_BOTTOM: FIRSTGID.OfficeAddons + 68,
  TABLE3_L_BOTTOM: FIRSTGID.OfficeAddons + 69,
  TABLE3_M_BOTTOM: FIRSTGID.OfficeAddons + 70,
  TABLE3_R_BOTTOM: FIRSTGID.OfficeAddons + 71,
  DOOR_V: FIRSTGID.OfficeAddons + 72,
  DOOR_H: FIRSTGID.OfficeAddons + 73,
};

// Wall collision GID
const WALL_COLLIDE = 149;

// Ground wall tiles (FloorAndGround tileset - from original map)
const WT = {
  TOP_L: 29, TOP: 594, TOP_R: 90,        // top edge
  FACE: 658,                                // wall face (below top)
  LEFT: 152, RIGHT: 154,                   // side edges
  BOT_L: 216, BOT: 217, BOT_R: 218,       // bottom edge
  INNER: 994,                               // solid wall interior
  CORNER_BL: 85,                            // inner corner
};

function resolveWallTile(data, er, ec, ER, EC) {
  function c(r, e) {
    if (r < 0 || r >= ER || e < 0 || e >= EC) return "outside";
    return data[r][e];
  }
  function isFloor(v) { return v !== "wall" && v !== "window" && v !== "outside"; }

  const up = c(er-1, ec), dn = c(er+1, ec), lt = c(er, ec-1), rt = c(er, ec+1);
  const uf = isFloor(up), df = isFloor(dn), lf = isFloor(lt), rf = isFloor(rt);

  // Bottom edge: floor above, wall/outside below
  if (uf && !df) {
    if (lf) return WT.BOT_L;
    if (rf) return WT.BOT_R;
    return WT.BOT;
  }
  // Top edge: floor below, wall above
  if (df && !uf) {
    if (lf) return WT.TOP_L;
    if (rf) return WT.TOP_R;
    return WT.TOP;
  }
  // Left edge: floor to the right
  if (rf && !lf && !uf && !df) return WT.LEFT;
  // Right edge: floor to the left
  if (lf && !rf && !uf && !df) return WT.RIGHT;
  // Left edge with floor above or below
  if (rf && !lf) return WT.LEFT;
  // Right edge with floor above or below
  if (lf && !rf) return WT.RIGHT;
  // Horizontal wall (floor above and below)
  if (uf && df) return WT.BOT;
  // Vertical wall (floor left and right)
  if (lf && rf) return WT.LEFT;
  // Interior wall (surrounded by walls)
  return WT.INNER;
}

// --- Parse editor data ---
function parseEditorData() {
  const html = fs.readFileSync(HTML_PATH, "utf8");
  const match = html.match(/var data = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("data not found in HTML");
  return JSON.parse(match[1]);
}

// --- Build map ---
function buildMap(editorData) {
  const ER = editorData.length;
  const EC = editorData[0].length;
  const COLS = EC + 2;
  const ROWS = ER + 2;
  const OX = 1, OY = 1;

  const ground = new Array(COLS * ROWS).fill(FLOOR_EMPTY);
  const groundVisual = new Array(COLS * ROWS).fill(FLOOR_EMPTY);
  const walls = [];
  const chairs = [];
  const objects = [];
  const objectsCollide = [];
  const furnitureCollision = [];
  const deskVisuals = [];
  const meetingVisuals = [];
  const genericObj = [];
  const genericObjCollide = [];
  const computers = [];
  const whiteboards = [];
  const basement = [];
  const vendingMachines = [];
  const wallDecor = [];
  const officeAddons = [];
  const officeAddonsCollide = [];
  let objId = 100;
  const processed = new Set();

  function setGround(mc, mr, gid) {
    if (mc >= 0 && mc < COLS && mr >= 0 && mr < ROWS)
      ground[mr * COLS + mc] = gid;
  }

  function setGroundVisual(mc, mr, gid) {
    if (mc >= 0 && mc < COLS && mr >= 0 && mr < ROWS)
      groundVisual[mr * COLS + mc] = gid;
  }

  function obj(gid, mc, mr, w, h, props) {
    const o = {
      gid, height: h || TILE, id: objId++, name: "", rotation: 0,
      type: "", visible: true, width: w || TILE,
      x: mc * TILE, y: mr * TILE + (h || TILE)
    };
    if (props) o.properties = props;
    return o;
  }

  function cell(er, ec) {
    if (er < 0 || er >= ER || ec < 0 || ec >= EC) return "outside";
    return editorData[er][ec];
  }

  function isWallCell(value) {
    return value === "wall" || value === "window";
  }

  function objectOrientation(er, ec, type) {
    const hasVertical = cell(er - 1, ec) === type || cell(er + 1, ec) === type;
    const hasHorizontal = cell(er, ec - 1) === type || cell(er, ec + 1) === type;
    if (hasVertical && !hasHorizontal) return "v";
    if (hasHorizontal && !hasVertical) return "h";
    if (ec === 0 || ec === EC - 1) return "v";
    if (er === 0 || er === ER - 1) return "h";
    return hasVertical ? "v" : "h";
  }

  function addAddon(gid, mc, mr, collidable = false) {
    const target = collidable ? officeAddonsCollide : officeAddons;
    target.push(obj(gid, mc, mr, TILE, TILE));
  }

  function addWallDecor(gid, mc, mr) {
    wallDecor.push(obj(gid, mc, mr, TILE, TILE));
  }

  function addDeskVisual(gid, mc, mr) {
    deskVisuals.push(obj(gid, mc, mr, TILE, TILE));
  }

  function addMeetingVisual(gid, mc, mr) {
    meetingVisuals.push(obj(gid, mc, mr, TILE, TILE));
  }

  function addOfficeObject(gid, mc, mr, collidable = false) {
    const target = collidable ? objectsCollide : objects;
    target.push(obj(gid, mc, mr, TILE, TILE));
  }

  function addArchiveOfficeObject(archiveGid, mc, mr, collidable = false) {
    const runtimeGid = FIRSTGID.ModernOffice + (archiveGid - 225);
    addOfficeObject(runtimeGid, mc, mr, collidable);
  }

  function addGenericObject(gid, mc, mr, collidable = false) {
    const target = collidable ? genericObjCollide : genericObj;
    target.push(obj(gid, mc, mr, TILE, TILE));
  }

  function addArchiveGenericObject(archiveGid, mc, mr, collidable = false) {
    const runtimeGid = FIRSTGID.Generic + (archiveGid - 1073);
    addGenericObject(runtimeGid, mc, mr, collidable);
  }

  function addPattern(gids, mc, mr, width, addFn) {
    gids.forEach((gid, index) => {
      const col = mc + (index % width);
      const row = mr + Math.floor(index / width);
      addFn(gid, col, row);
    });
  }

  function addChairAt(mc, mr, direction) {
    const variants = CHAIR[direction];
    const gid = variants[(mc + mr) % variants.length];
    chairs.push(
      obj(gid, mc, mr, TILE, 64, [
        { name: "direction", type: "string", value: direction },
      ])
    );
  }

  function addComputerAt(mc, mr) {
    const gid = COMPUTERS[compIdx % COMPUTERS.length];
    compIdx++;
    computers.push(obj(gid, mc, mr, 48, 40));
  }

  function addComputerForRun(run, mr) {
    const startMc = run[0] + OX;
    const endMc = run[run.length - 1] + OX;
    const leftX = ((startMc + endMc + 1) * TILE) / 2 - 24;
    addComputerAt(leftX / TILE, mr - 2);
  }

  function fillGroundRect(fromCol, fromRow, toCol, toRow, gid) {
    for (let mr = fromRow; mr <= toRow; mr++) {
      for (let mc = fromCol; mc <= toCol; mc++) {
        setGround(mc, mr, gid);
      }
    }
  }

  function fillGroundVisualRect(fromCol, fromRow, toCol, toRow, gid) {
    for (let mr = fromRow; mr <= toRow; mr++) {
      for (let mc = fromCol; mc <= toCol; mc++) {
        setGroundVisual(mc, mr, gid);
      }
    }
  }

  function withinRect(object, minX, minY, maxX, maxY) {
    return object.x >= minX && object.x <= maxX && object.y >= minY && object.y <= maxY;
  }

  function prune(array, predicate) {
    for (let i = array.length - 1; i >= 0; i--) {
      if (predicate(array[i])) array.splice(i, 1);
    }
  }

  function addDeskRunVisual(run, mr, bottom = false) {
    const cols = run.map((col) => col + OX);
    if (cols.length === 3) {
      const gids = bottom
        ? [ADDON.DESK3_L_BOTTOM, ADDON.DESK3_M_BOTTOM, ADDON.DESK3_R_BOTTOM]
        : [ADDON.DESK3_L_TOP, ADDON.DESK3_M_TOP, ADDON.DESK3_R_TOP];
      gids.forEach((gid, index) => addDeskVisual(gid, cols[index], mr));
    } else if (cols.length === 2) {
      const gids = bottom
        ? [ADDON.DESK2_L_BOTTOM, ADDON.DESK2_R_BOTTOM]
        : [ADDON.DESK2_L_TOP, ADDON.DESK2_R_TOP];
      gids.forEach((gid, index) => addDeskVisual(gid, cols[index], mr));
    } else if (cols.length === 1) {
      addDeskVisual(bottom ? ADDON.DESK1_BOTTOM : ADDON.DESK1_TOP, cols[0], mr);
    }
  }

  function addMeetingRowVisual(startCol, mr, width, bottom) {
    const mc = startCol + OX;
    if (width === 1) {
      addMeetingVisual(bottom ? ADDON.TABLE1_BOTTOM : ADDON.TABLE1_TOP, mc, mr);
    } else if (width === 2) {
      addMeetingVisual(bottom ? ADDON.TABLE2_L_BOTTOM : ADDON.TABLE2_L_TOP, mc, mr);
      addMeetingVisual(bottom ? ADDON.TABLE2_R_BOTTOM : ADDON.TABLE2_R_TOP, mc + 1, mr);
    } else if (width === 3) {
      addMeetingVisual(bottom ? ADDON.TABLE3_L_BOTTOM : ADDON.TABLE3_L_TOP, mc, mr);
      addMeetingVisual(bottom ? ADDON.TABLE3_M_BOTTOM : ADDON.TABLE3_M_TOP, mc + 1, mr);
      addMeetingVisual(bottom ? ADDON.TABLE3_R_BOTTOM : ADDON.TABLE3_R_TOP, mc + 2, mr);
    } else if (width >= 4) {
      addMeetingRowVisual(startCol, mr, 2, bottom);
      addMeetingRowVisual(startCol + 2, mr, 2, bottom);
    }
  }

  function getWallMask(er, ec) {
    let mask = 0;
    if (!isWallCell(cell(er - 1, ec))) mask |= 1;
    if (!isWallCell(cell(er + 1, ec))) mask |= 2;
    if (!isWallCell(cell(er, ec - 1))) mask |= 4;
    if (!isWallCell(cell(er, ec + 1))) mask |= 8;
    return mask;
  }

  function mark(er, ec) { processed.add(`${er},${ec}`); }
  function marked(er, ec) { return processed.has(`${er},${ec}`); }

  function hrun(er, ec, type) {
    const r = [];
    for (let c = ec; c < EC && editorData[er][c] === type; c++) r.push(c);
    return r;
  }

  function chairDir(er, ec) {
    if (cell(er - 1, ec).startsWith("desk-n")) return "up";
    if (cell(er + 1, ec).startsWith("desk-s")) return "down";
    if (cell(er + 1, ec).startsWith("desk-n")) return "down";
    if (cell(er - 1, ec).startsWith("desk-s")) return "up";
    if (cell(er, ec - 1).startsWith("desk-w")) return "right";
    if (cell(er, ec + 1).startsWith("desk-e")) return "left";
    if (cell(er, ec + 1).startsWith("desk-w")) return "left";
    if (cell(er, ec - 1).startsWith("desk-e")) return "right";
    return "down";
  }

  // --- Process each cell ---
  for (let er = 0; er < ER; er++) {
    for (let ec = 0; ec < EC; ec++) {
      if (marked(er, ec)) continue;
      const c = editorData[er][ec];
      const mc = ec + OX;
      const mr = er + OY;

      // Ground: all interior cells get floor
      if (c === "meeting" || c === "table") {
        setGround(mc, mr, FLOOR_MEETING);
        setGroundVisual(mc, mr, FLOOR_VISUAL_MEETING);
      } else if (c === "wall") {
        setGround(mc, mr, resolveWallTile(editorData, er, ec, ER, EC));
        setGroundVisual(mc, mr, FLOOR_VISUAL_MEETING);
        walls.push(obj(WALL_COLLIDE, mc, mr, TILE, TILE));
        addWallDecor(ADDON.WALL_MASK_BASE + getWallMask(er, ec), mc, mr);
      } else if (c === "window") {
        setGround(mc, mr, resolveWallTile(editorData, er, ec, ER, EC));
        setGroundVisual(mc, mr, FLOOR_VISUAL_OFFICE);
        walls.push(obj(WALL_COLLIDE, mc, mr, TILE, TILE));
        addWallDecor(ADDON.WALL_MASK_BASE + getWallMask(er, ec), mc, mr);
      } else if (c === "glass") {
        setGround(mc, mr, FLOOR_OFFICE);
        setGroundVisual(mc, mr, FLOOR_VISUAL_OFFICE);
        walls.push(obj(WALL_COLLIDE, mc, mr, TILE, TILE));
      } else if (c === "door") {
        setGround(mc, mr, FLOOR_OFFICE);
        setGroundVisual(mc, mr, FLOOR_VISUAL_OFFICE);
      } else {
        setGround(mc, mr, FLOOR_OFFICE);
        setGroundVisual(mc, mr, FLOOR_VISUAL_OFFICE);
      }

      // --- Objects ---
      switch (c) {
        case "desk-n": {
          const run = hrun(er, ec, "desk-n");
          run.forEach((col, i) => {
            mark(er, col);
            const gid = i === 0 ? DESK_H[0] : i === run.length - 1 ? DESK_H[2] : DESK_H[1];
            furnitureCollision.push(obj(gid, col + OX, mr, TILE, TILE));
          });
          addDeskRunVisual(run, mr, false);
          break;
        }
        case "desk-s": {
          const run = hrun(er, ec, "desk-s");
          run.forEach((col, i) => {
            mark(er, col);
            const gid = i === 0 ? DESK_H[0] : i === run.length - 1 ? DESK_H[2] : DESK_H[1];
            furnitureCollision.push(obj(gid, col + OX, mr, TILE, TILE));
          });
          addDeskRunVisual(run, mr, true);
          break;
        }
        case "desk-w":
          furnitureCollision.push(obj(DESK_SIDE_W, mc, mr, TILE, TILE));
          addDeskVisual(ADDON.DESK1_TOP, mc, mr);
          break;
        case "desk-e":
          furnitureCollision.push(obj(DESK_SIDE_E, mc, mr, TILE, TILE));
          addDeskVisual(ADDON.DESK1_BOTTOM, mc, mr);
          break;
        case "chair": {
          const dir = chairDir(er, ec);
          const variants = CHAIR[dir];
          const gid = variants[(er + ec) % variants.length];
          chairs.push(obj(gid, mc, mr, TILE, 64, [
            { name: "direction", type: "string", value: dir }
          ]));
          break;
        }
        case "computer": {
          const run = hrun(er, ec, "computer");
          addComputerForRun(run, mr);
          run.forEach(col => mark(er, col));
          break;
        }
        case "whiteboard":
          whiteboards.push(obj(WHITEBOARDS[whiteboardIdx % WHITEBOARDS.length], mc, mr, 64, 64));
          whiteboardIdx++;
          break;
        case "window":
          addAddon(
            objectOrientation(er, ec, "window") === "v" ? ADDON.WINDOW_V : ADDON.WINDOW_H,
            mc,
            mr
          );
          break;
        case "door":
          addAddon(
            (cell(er - 1, ec) === "wall" || cell(er + 1, ec) === "wall") ? ADDON.DOOR_V : ADDON.DOOR_H,
            mc,
            mr
          );
          break;
        case "glass":
          addAddon(
            objectOrientation(er, ec, "glass") === "v" ? ADDON.GLASS_V : ADDON.GLASS_H,
            mc,
            mr
          );
          break;
        case "table": {
          let cols = 0;
          for (let c2 = ec; c2 < EC && editorData[er][c2] === "table"; c2++) cols++;
          let rows = 0;
          outer: for (let r2 = er; r2 < ER; r2++) {
            for (let c2 = ec; c2 < ec + cols; c2++) {
              if (cell(r2, c2) !== "table") break outer;
            }
            rows++;
          }
          for (let tr = 0; tr < rows; tr += 2) {
            for (let tc = 0; tc < cols; tc += 2) {
              const tmc = ec + tc + OX;
              const tmr = er + tr + OY;
              furnitureCollision.push(obj(TABLE_TL, tmc, tmr, TILE, TILE));
              if (tc + 1 < cols) furnitureCollision.push(obj(TABLE_TR, tmc + 1, tmr, TILE, TILE));
              if (tr + 1 < rows) furnitureCollision.push(obj(TABLE_BL, tmc, tmr + 1, TILE, TILE));
              if (tc + 1 < cols && tr + 1 < rows) furnitureCollision.push(obj(TABLE_BR, tmc + 1, tmr + 1, TILE, TILE));
            }
          }
          for (let tr = 0; tr < rows; tr++) {
            addMeetingRowVisual(ec, er + tr + OY, cols, tr === rows - 1 && rows > 1);
          }
          for (let tr = 0; tr < rows; tr++)
            for (let tc = 0; tc < cols; tc++)
              mark(er + tr, ec + tc);
          break;
        }
        case "plant":
          objects.push(obj(PLANT, mc, mr, TILE, TILE));
          break;
        case "printer":
          objectsCollide.push(obj(PRINTER_L, mc, mr, TILE, TILE));
          break;
        case "vending":
          vendingMachines.push(obj(FIRSTGID.vendingmachine, mc, mr, 48, 72));
          break;
        case "counter":
        case "sink":
          break;
      }
    }
  }

  function decorateOffice() {
    fillGroundRect(1, 8, 17, 18, FLOOR_OFFICE);
    fillGroundRect(12, 19, 18, 22, FLOOR_OFFICE);
    fillGroundVisualRect(1, 8, 17, 18, FLOOR_VISUAL_OFFICE);
    fillGroundVisualRect(12, 19, 18, 22, FLOOR_VISUAL_OFFICE);

    // Move pantry to the large lower-right room.
    prune(
      officeAddons,
      (object) => withinRect(object, 384, 608, 576, 736) && object.gid !== ADDON.ACCENT_PLANT
    );
    prune(officeAddonsCollide, (object) => withinRect(object, 384, 608, 576, 736));

    fillGroundRect(12, 23, 18, 30, FLOOR_KITCHEN);
    fillGroundVisualRect(12, 23, 18, 30, FLOOR_VISUAL_KITCHEN);
    addAddon(ADDON.SIGN_KITCHEN, 15, 22);
    addAddon(ADDON.RED_MAT, 13, 27);
    addAddon(ADDON.RED_MAT_ALT, 14, 27);
    addAddon(ADDON.RED_MAT, 15, 27);
    addAddon(ADDON.RED_MAT_ALT, 16, 27);
    addAddon(ADDON.KITCHEN_COFFEE, 13, 24, true);
    addAddon(ADDON.KITCHEN_SNACK_ALT, 14, 24, true);
    addAddon(ADDON.KITCHEN_STORAGE_ALT, 15, 24, true);
    addAddon(ADDON.FRIDGE_ALT, 16, 24, true);
    addAddon(ADDON.LOCKER_ALT, 17, 24, true);
    addAddon(ADDON.CUPS, 13, 23);
    addAddon(ADDON.CUPS_ALT, 15, 23);
    addAddon(ADDON.ACCENT_PLANT, 12, 24);
    addAddon(ADDON.PLANT_ALT, 18, 24);
    addAddon(ADDON.ACCENT_PLANT, 12, 26);
    addAddon(ADDON.PLANT_ALT, 18, 26);
    addAddon(ADDON.GLASS_DOOR_H, 14, 23);

    // Use the mid-right pocket as a calm copy/support nook instead of pantry.
    fillGroundRect(13, 20, 17, 22, FLOOR_OFFICE);
    fillGroundVisualRect(13, 20, 17, 22, FLOOR_VISUAL_OFFICE);
    addAddon(ADDON.ACCENT_PLANT, 12, 21);
    addAddon(ADDON.PLANT_ALT, 17, 20);

    // Meeting room labels and greenery
    addAddon(ADDON.SIGN_MEETING, 2, 6);
    addAddon(ADDON.SIGN_MEETING, 8, 6);
    addAddon(ADDON.SIGN_MEETING, 14, 6);
    addAddon(ADDON.ACCENT_PLANT, 1, 7);
    addAddon(ADDON.PLANT_ALT, 18, 7);
    addAddon(ADDON.ACCENT_PLANT, 6, 19);
    addAddon(ADDON.PLANT_ALT, 12, 19);

    // Warm finishing touches to make workstations feel less empty
    addAddon(ADDON.ACCENT_PLANT, 1, 24);
    addAddon(ADDON.PLANT_ALT, 11, 24);

    // Chairs around lower-left meeting table for a more real office feel
    addChairAt(2, 24, "right");
    addChairAt(2, 29, "right");

    // --- Curated room dressing using high-confidence archive furniture tiles ---
    // Meeting rooms: presentation screens and corner plants, without blocking chairs/tables.
    addPattern([410, 411], 7, 2, 2, addArchiveOfficeObject);
    addPattern([410, 411], 14, 2, 2, addArchiveOfficeObject);
    addArchiveOfficeObject(439, 5, 4);
    addArchiveOfficeObject(439, 11, 4);
    addArchiveOfficeObject(439, 12, 4);
    addArchiveOfficeObject(439, 17, 4);
    addArchiveOfficeObject(389, 1, 4);
    addArchiveOfficeObject(405, 16, 4);
    addArchiveGenericObject(2088, 2, 2);
    addArchiveGenericObject(2104, 15, 2);

    // Open-office perimeter: only wall-adjacent decor.
    addArchiveOfficeObject(439, 1, 16);
    addArchiveOfficeObject(439, 18, 16);
    addPattern([410, 411], 1, 10, 2, addArchiveOfficeObject);
    addPattern([410, 411], 14, 10, 2, addArchiveOfficeObject);
    addArchiveOfficeObject(455, 1, 7);
    addArchiveOfficeObject(455, 18, 7);

    // Lower-left focus rooms: small private-office treatment.
    addPattern([410, 411], 2, 22, 2, addArchiveOfficeObject);
    addPattern([410, 411], 2, 28, 2, addArchiveOfficeObject);
    addArchiveOfficeObject(439, 1, 27);
    addArchiveOfficeObject(439, 6, 27);
    addPattern([472, 473, 488, 489], 3, 22, 2, addArchiveOfficeObject);
    addPattern([504, 505], 3, 28, 2, addArchiveOfficeObject);
    addArchiveGenericObject(1771, 5, 22);
    addArchiveGenericObject(1772, 6, 22);
    addArchiveGenericObject(1787, 5, 28);
    addArchiveGenericObject(1788, 6, 28);

    // Break room: sofa + coffee table composition, plus wall display and corner plants.
    addPattern([579, 580, 581], 13, 29, 3, addArchiveOfficeObject);
    addPattern([699, 700, 701], 13, 28, 3, addArchiveOfficeObject);
    addPattern([410, 411], 14, 27, 2, addArchiveOfficeObject);
    addArchiveOfficeObject(439, 12, 28);
    addArchiveOfficeObject(439, 18, 28);
    addPattern([472, 473, 488, 489], 13, 20, 2, addArchiveOfficeObject);
    addPattern([595, 596, 611, 612, 627, 628], 16, 20, 2, addArchiveOfficeObject);
    addArchiveOfficeObject(455, 15, 21);
    addArchiveOfficeObject(369, 11, 27);
    addArchiveOfficeObject(370, 12, 27);
    addArchiveOfficeObject(372, 11, 28);
    addArchiveOfficeObject(373, 12, 28);
    addArchiveOfficeObject(374, 12, 29);
    addArchiveOfficeObject(468, 11, 29);
    addArchiveOfficeObject(469, 12, 29);
    addArchiveOfficeObject(484, 11, 30);
    addArchiveOfficeObject(485, 12, 30);
    addArchiveOfficeObject(493, 16, 27);
    addArchiveOfficeObject(509, 17, 27);
    addAddon(ADDON.KITCHEN_LEFT, 13, 20, true);
    addAddon(ADDON.KITCHEN_SNACK, 14, 20, true);
    addAddon(ADDON.KITCHEN_RIGHT, 15, 20, true);
    addAddon(ADDON.KITCHEN_FILL, 13, 21);
    addAddon(ADDON.KITCHEN_COFFEE_ALT, 14, 21, true);
    addAddon(ADDON.KITCHEN_RIGHT_ALT, 15, 21, true);
    addAddon(ADDON.SIGN_WINDOW, 14, 19);
    addAddon(ADDON.SIGN_LOUNGE, 15, 19);
    addAddon(ADDON.PARTITION_H, 13, 22);
    addAddon(ADDON.PARTITION_H, 14, 22);
    addAddon(ADDON.PARTITION_H, 15, 22);
    addAddon(ADDON.PARTITION_V, 12, 21);
    addAddon(ADDON.GLASS_DOOR_V, 18, 21);
  }

  decorateOffice();

  // Find spawn for logging
  for (let er = 0; er < ER; er++)
    for (let ec = 0; ec < EC; ec++)
      if (editorData[er][ec] === "spawn")
        console.log(`[spawn] pixel: x=${(ec+OX)*TILE}, y=${(er+OY)*TILE}`);

  function layer(id, name, objs) {
    return { draworder: "topdown", id, name, objects: objs, opacity: 1, type: "objectgroup", visible: true, x: 0, y: 0 };
  }

  return {
    compressionlevel: -1,
    height: ROWS,
    infinite: false,
    layers: [
      { data: ground, height: ROWS, id: 2, name: "Ground", opacity: 1, type: "tilelayer", visible: false, width: COLS, x: 0, y: 0 },
      { data: groundVisual, height: ROWS, id: 3, name: "GroundVisual", opacity: 1, type: "tilelayer", visible: true, width: COLS, x: 0, y: 0 },
      layer(4, "Wall", walls),
      layer(5, "WallDecor", wallDecor),
      layer(6, "FurnitureCollision", furnitureCollision),
      layer(7, "DeskVisuals", deskVisuals),
      layer(8, "MeetingVisuals", meetingVisuals),
      layer(9, "Chair", chairs),
      layer(10, "Objects", objects),
      layer(11, "ObjectsOnCollide", objectsCollide),
      layer(12, "GenericObjects", genericObj),
      layer(13, "GenericObjectsOnCollide", genericObjCollide),
      layer(14, "Computer", computers),
      layer(15, "Whiteboard", whiteboards),
      layer(16, "Basement", basement),
      layer(17, "VendingMachine", vendingMachines),
      layer(18, "OfficeAddons", officeAddons),
      layer(19, "OfficeAddonsOnCollide", officeAddonsCollide),
    ],
    nextlayerid: 20,
    nextobjectid: objId,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.7.2",
    tileheight: TILE,
    tilesets: [
      { columns: 64, firstgid: 1, image: "FloorAndGround.png", imageheight: 1280, imagewidth: 2048, margin: 0, name: "FloorAndGround", spacing: 0, tilecount: 2560, tileheight: 32, tilewidth: 32 },
      { columns: 1, firstgid: 2561, image: "../items/chair.png", imageheight: 1472, imagewidth: 32, margin: 0, name: "chair", spacing: 0, tilecount: 23, tileheight: 64, tilewidth: 32 },
      { columns: 16, firstgid: 2584, image: "../tileset/Modern_Office_Black_Shadow.png", imageheight: 1696, imagewidth: 512, margin: 0, name: "Modern_Office_Black_Shadow", spacing: 0, tilecount: 848, tileheight: 32, tilewidth: 32 },
      { columns: 16, firstgid: 3432, image: "../tileset/Generic.png", imageheight: 2496, imagewidth: 512, margin: 0, name: "Generic", spacing: 0, tilecount: 1248, tileheight: 32, tilewidth: 32 },
      { columns: 6, firstgid: 4680, image: "../items/computer.png", imageheight: 40, imagewidth: 288, margin: 0, name: "computer", spacing: 0, tilecount: 6, tileheight: 40, tilewidth: 48 },
      { columns: 1, firstgid: 4686, image: "../items/whiteboard.png", imageheight: 192, imagewidth: 64, margin: 0, name: "whiteboard", spacing: 0, tilecount: 3, tileheight: 64, tilewidth: 64 },
      { columns: 16, firstgid: 4689, image: "../tileset/Basement.png", imageheight: 1600, imagewidth: 512, margin: 0, name: "Basement", spacing: 0, tilecount: 800, tileheight: 32, tilewidth: 32 },
      { columns: 1, firstgid: 5489, image: "../items/vendingmachine.png", imageheight: 72, imagewidth: 48, margin: 0, name: "vendingmachine", spacing: 0, tilecount: 1, tileheight: 72, tilewidth: 48 },
      { columns: 16, firstgid: 5490, image: "../tileset/Modern_Office_Addons.png", imageheight: 160, imagewidth: 512, margin: 0, name: "Modern_Office_Addons", spacing: 0, tilecount: 80, tileheight: 32, tilewidth: 32 },
      { columns: 16, firstgid: 5570, image: "../archive/Room_Builder_Office.png", imageheight: 448, imagewidth: 512, margin: 0, name: "Room_Builder_Office_Archive", spacing: 0, tilecount: 224, tileheight: 32, tilewidth: 32 },
      { columns: 15, firstgid: 5794, image: "../archive/Room_Builder_Floors.png", imageheight: 1280, imagewidth: 480, margin: 0, name: "Room_Builder_Floors_Archive", spacing: 0, tilecount: 600, tileheight: 32, tilewidth: 32 },
    ],
    tilewidth: TILE,
    type: "map",
    version: "1.6",
    width: COLS,
  };
}

function validateTileLayerGids(mapJson) {
  const gidRanges = mapJson.tilesets.map((tileset) => ({
    name: tileset.name,
    firstgid: tileset.firstgid,
    lastgid: tileset.firstgid + tileset.tilecount - 1,
  }));

  const invalidTiles = [];

  mapJson.layers.forEach((layer) => {
    if (layer.type !== "tilelayer") return;

    layer.data.forEach((gid, index) => {
      if (gid === 0) return;

      const hasTileset = gidRanges.some((range) => gid >= range.firstgid && gid <= range.lastgid);
      if (!hasTileset) {
        invalidTiles.push({ layer: layer.name, gid, index });
      }
    });
  });

  if (invalidTiles.length > 0) {
    const summary = invalidTiles
      .slice(0, 10)
      .map(({ layer, gid, index }) => `${layer}@${index}=${gid}`)
      .join(", ");

    throw new Error(`Generated map contains tile gids without a tileset: ${summary}`);
  }
}

// --- Main ---
const data = parseEditorData();
console.log(`[generate-map] ${data[0].length}x${data.length} grid`);
const mapJson = buildMap(data);
validateTileLayerGids(mapJson);
mapJson.layers.forEach(l => {
  if (l.type === "tilelayer") console.log(`  Ground: ${l.data.filter(d => d > 0).length}/${l.data.length}`);
  else console.log(`  ${l.name}: ${l.objects.length} objects`);
});
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mapJson));
console.log(`[generate-map] saved: ${(fs.statSync(OUTPUT_PATH).size/1024).toFixed(1)}KB`);
