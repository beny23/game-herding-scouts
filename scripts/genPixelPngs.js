import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  // Standard CRC32 (IEEE 802.3)
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = u32be(data.length);
  const crcBuf = u32be(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function writePngRGBA(filePath, width, height, rgba) {
  if (rgba.length !== width * height * 4) throw new Error('RGBA buffer size mismatch');

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // Filter type 0 per scanline.
  const stride = width * 4;
  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0;
    rgba.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, png);
}

function makeImage(width, height, fill) {
  const buf = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const c = typeof fill === 'function' ? fill(x, y) : fill;
      buf[i + 0] = c[0];
      buf[i + 1] = c[1];
      buf[i + 2] = c[2];
      buf[i + 3] = c[3];
    }
  }
  return buf;
}

function setPx(buf, width, x, y, c) {
  if (x < 0 || y < 0 || x >= width) return;
  const i = (y * width + x) * 4;
  buf[i + 0] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
  buf[i + 3] = c[3];
}

function fillRect(buf, width, x0, y0, w, h, c) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      setPx(buf, width, x, y, c);
    }
  }
}

function outlineRect(buf, width, x0, y0, w, h, c) {
  for (let x = x0; x < x0 + w; x++) {
    setPx(buf, width, x, y0, c);
    setPx(buf, width, x, y0 + h - 1, c);
  }
  for (let y = y0; y < y0 + h; y++) {
    setPx(buf, width, x0, y, c);
    setPx(buf, width, x0 + w - 1, y, c);
  }
}

function fillCircle(buf, width, cx, cy, r, c) {
  const r2 = r * r;
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPx(buf, width, x, y, c);
    }
  }
}

function strokeCircle(buf, width, cx, cy, r, c) {
  const r2 = r * r;
  const inner2 = (r - 1) * (r - 1);
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2 && d2 >= inner2) setPx(buf, width, x, y, c);
    }
  }
}

function sprinkle(buf, width, x0, y0, w, h, colors, stepA, stepB) {
  // Deterministic pseudo-noise using modular steps.
  let k = 0;
  for (let i = 0; i < w * h; i++) {
    k = (k + stepA) % (w * h);
    if ((k % stepB) !== 0) continue;
    const x = x0 + (k % w);
    const y = y0 + Math.floor(k / w);
    const col = colors[(k + i) % colors.length];
    setPx(buf, width, x, y, col);
  }
}

// Limited palette (roughly aligned with current UI colors)
const P = {
  ink: [11, 18, 32, 255],
  bg: [7, 12, 20, 255],
  grassA: [15, 42, 26, 255],
  grassB: [18, 50, 31, 255],
  grassC: [25, 72, 45, 255],
  dirt: [72, 42, 24, 255],
  sand: [95, 78, 45, 255],
  waterA: [11, 41, 66, 255],
  waterB: [30, 58, 138, 255],
  waterHi: [56, 189, 248, 255],
  wood: [124, 45, 18, 255],
  woodHi: [154, 52, 18, 255],
  rock: [48, 68, 108, 255],
  rockHi: [73, 104, 160, 255],
  cloth: [59, 130, 246, 255],
  skin: [234, 179, 8, 255],
  white: [229, 231, 235, 255],
  clear: [0, 0, 0, 0],
};

function genTileset32(outPath) {
  const tileW = 32;
  const tileH = 32;
  const tiles = 7;
  const width = tileW * tiles;
  const height = tileH;

  const img = makeImage(width, height, P.clear);
  const tileX = (index) => index * tileW;

  // 0: forest_a (denser)
  fillRect(img, width, tileX(0), 0, tileW, tileH, P.grassA);
  sprinkle(img, width, tileX(0), 0, tileW, tileH, [P.grassB, P.grassC], 37, 7);
  // darker blobs
  for (let i = 0; i < 3; i++) fillCircle(img, width, tileX(0) + 8 + i * 9, 10 + i * 6, 6, [5, 14, 9, 85]);
  // tiny flowers
  for (let i = 0; i < 4; i++) setPx(img, width, tileX(0) + 6 + i * 7, 24 - (i % 2), [251, 191, 36, 170]);
  outlineRect(img, width, tileX(0), 0, tileW, tileH, [0, 0, 0, 40]);

  // 1: forest_b (lighter, more variation)
  fillRect(img, width, tileX(1), 0, tileW, tileH, P.grassB);
  sprinkle(img, width, tileX(1), 0, tileW, tileH, [P.grassA, P.grassC], 41, 6);
  // mossy highlights
  for (let i = 0; i < 4; i++) fillCircle(img, width, tileX(1) + 10 + i * 5, 9 + (i % 2) * 7, 4, [34, 197, 94, 80]);
  outlineRect(img, width, tileX(1), 0, tileW, tileH, [0, 0, 0, 40]);

  // 2: clearing (dirt+grass mix)
  fillRect(img, width, tileX(2), 0, tileW, tileH, [42, 47, 29, 255]);
  sprinkle(img, width, tileX(2), 0, tileW, tileH, [[163, 163, 106, 110], [95, 78, 45, 110], [72, 42, 24, 80]], 29, 5);
  fillRect(img, width, tileX(2) + 2, 20, 6, 3, [95, 78, 45, 140]);
  outlineRect(img, width, tileX(2), 0, tileW, tileH, [0, 0, 0, 40]);

  // 3: path (more defined, with edge pebbles)
  fillRect(img, width, tileX(3), 0, tileW, tileH, P.bg);
  fillRect(img, width, tileX(3), 9, tileW, 14, P.dirt);
  fillRect(img, width, tileX(3), 10, tileW, 12, P.sand);
  for (let i = 0; i < 18; i++) {
    const x = tileX(3) + 3 + (i * 7) % 26;
    const y = 12 + (i * 5) % 10;
    setPx(img, width, x, y, [229, 231, 235, 110]);
    if (i % 3 === 0) setPx(img, width, x + 1, y, [229, 231, 235, 70]);
  }
  outlineRect(img, width, tileX(3), 0, tileW, tileH, [0, 0, 0, 40]);

  // 4: water (waves + depth)
  fillRect(img, width, tileX(4), 0, tileW, tileH, P.waterA);
  // deeper bottom band
  fillRect(img, width, tileX(4), 22, tileW, 10, [8, 28, 46, 255]);
  for (let y = 0; y < tileH; y += 6) {
    for (let x = 2; x < tileW - 2; x += 9) {
      setPx(img, width, tileX(4) + x, y + 2, [P.waterHi[0], P.waterHi[1], P.waterHi[2], 70]);
      setPx(img, width, tileX(4) + x + 1, y + 2, [P.waterHi[0], P.waterHi[1], P.waterHi[2], 50]);
      setPx(img, width, tileX(4) + x + 2, y + 2, [P.waterHi[0], P.waterHi[1], P.waterHi[2], 35]);
    }
  }
  sprinkle(img, width, tileX(4), 0, tileW, tileH, [[P.waterB[0], P.waterB[1], P.waterB[2], 75]], 23, 4);
  outlineRect(img, width, tileX(4), 0, tileW, tileH, [0, 0, 0, 40]);

  // 5: tree (chunkier silhouette)
  fillRect(img, width, tileX(5), 0, tileW, tileH, P.grassA);
  fillCircle(img, width, tileX(5) + 16, 13, 10, [20, 83, 45, 255]);
  fillCircle(img, width, tileX(5) + 14, 12, 8, [22, 101, 52, 255]);
  fillCircle(img, width, tileX(5) + 19, 14, 7, [15, 42, 26, 180]);
  fillRect(img, width, tileX(5) + 14, 18, 4, 11, P.wood);
  fillRect(img, width, tileX(5) + 14, 18, 2, 11, P.woodHi);
  strokeCircle(img, width, tileX(5) + 16, 13, 10, P.ink);
  outlineRect(img, width, tileX(5), 0, tileW, tileH, [0, 0, 0, 40]);

  // 6: rock (more depth)
  fillRect(img, width, tileX(6), 0, tileW, tileH, P.grassB);
  fillRect(img, width, tileX(6) + 8, 13, 16, 13, P.rock);
  fillRect(img, width, tileX(6) + 10, 15, 10, 6, P.rockHi);
  // little crack
  for (let i = 0; i < 8; i++) setPx(img, width, tileX(6) + 12 + i, 20 + (i % 2), [11, 18, 32, 140]);
  outlineRect(img, width, tileX(6) + 8, 13, 16, 13, P.ink);
  outlineRect(img, width, tileX(6), 0, tileW, tileH, [0, 0, 0, 40]);

  writePngRGBA(outPath, width, height, img);
}

function genLeader32(outPath) {
  const width = 32;
  const height = 32;
  const img = makeImage(width, height, P.clear);

  // Shadow base (helps readability over grass)
  fillCircle(img, width, 16, 26, 9, [0, 0, 0, 55]);

  // Head + hair
  fillRect(img, width, 12, 6, 8, 7, P.skin);
  fillRect(img, width, 12, 6, 8, 2, [31, 41, 55, 255]);
  outlineRect(img, width, 12, 6, 8, 7, P.ink);

  // Body (blue coat)
  fillRect(img, width, 10, 13, 12, 12, P.cloth);
  // highlight strip
  fillRect(img, width, 11, 14, 3, 10, [147, 197, 253, 130]);
  outlineRect(img, width, 10, 13, 12, 12, P.ink);

  // Backpack
  fillRect(img, width, 21, 14, 4, 8, P.wood);
  outlineRect(img, width, 21, 14, 4, 8, P.ink);

  // Legs/boots
  fillRect(img, width, 11, 25, 4, 6, [17, 24, 39, 255]);
  fillRect(img, width, 17, 25, 4, 6, [17, 24, 39, 255]);
  fillRect(img, width, 11, 29, 4, 2, P.woodHi);
  fillRect(img, width, 17, 29, 4, 2, P.woodHi);
  outlineRect(img, width, 11, 25, 4, 6, P.ink);
  outlineRect(img, width, 17, 25, 4, 6, P.ink);

  writePngRGBA(outPath, width, height, img);
}

function genScout32(outPath) {
  const width = 32;
  const height = 32;
  const img = makeImage(width, height, P.clear);

  fillCircle(img, width, 16, 26, 9, [0, 0, 0, 55]);

  // Head + bandana
  fillRect(img, width, 12, 6, 8, 7, P.skin);
  fillRect(img, width, 12, 8, 8, 2, [244, 114, 182, 255]);
  outlineRect(img, width, 12, 6, 8, 7, P.ink);

  // Body (green tunic)
  const shirt = [16, 185, 129, 255];
  fillRect(img, width, 10, 13, 12, 12, shirt);
  fillRect(img, width, 11, 14, 3, 10, [52, 211, 153, 120]);
  outlineRect(img, width, 10, 13, 12, 12, P.ink);

  // Tool (tiny axe)
  fillRect(img, width, 8, 18, 2, 9, P.wood);
  fillRect(img, width, 6, 18, 3, 3, P.rockHi);
  outlineRect(img, width, 8, 18, 2, 9, P.ink);

  // Boots
  fillRect(img, width, 11, 25, 4, 6, [17, 24, 39, 255]);
  fillRect(img, width, 17, 25, 4, 6, [17, 24, 39, 255]);
  fillRect(img, width, 11, 29, 4, 2, [154, 52, 18, 200]);
  fillRect(img, width, 17, 29, 4, 2, [154, 52, 18, 200]);
  outlineRect(img, width, 11, 25, 4, 6, P.ink);
  outlineRect(img, width, 17, 25, 4, 6, P.ink);

  writePngRGBA(outPath, width, height, img);
}

function genSpark(outPath) {
  const width = 4;
  const height = 4;
  const img = makeImage(width, height, P.clear);
  setPx(img, width, 1, 1, P.white);
  setPx(img, width, 2, 1, [P.white[0], P.white[1], P.white[2], 180]);
  setPx(img, width, 1, 2, [P.white[0], P.white[1], P.white[2], 180]);
  setPx(img, width, 2, 2, [P.white[0], P.white[1], P.white[2], 120]);
  writePngRGBA(outPath, width, height, img);
}

function genShadow(outPath) {
  const width = 48;
  const height = 24;
  const img = makeImage(width, height, P.clear);
  // Pixel shadow with a few alpha bands.
  fillCircle(img, width, 24, 12, 14, [0, 0, 0, 40]);
  fillCircle(img, width, 24, 12, 11, [0, 0, 0, 55]);
  fillCircle(img, width, 24, 12, 8, [0, 0, 0, 70]);
  writePngRGBA(outPath, width, height, img);
}

function genRing(outPath) {
  const width = 64;
  const height = 64;
  const img = makeImage(width, height, P.clear);
  strokeCircle(img, width, 32, 32, 26, [56, 189, 248, 200]);
  strokeCircle(img, width, 32, 32, 22, [229, 231, 235, 220]);
  strokeCircle(img, width, 32, 32, 18, [147, 197, 253, 140]);
  writePngRGBA(outPath, width, height, img);
}

function genLabelBg(outPath) {
  const width = 128;
  const height = 32;
  const img = makeImage(width, height, P.clear);
  // Simple pixel pill.
  fillRect(img, width, 4, 6, width - 8, height - 12, [11, 18, 32, 210]);
  // corners
  fillRect(img, width, 2, 8, 2, height - 16, [11, 18, 32, 210]);
  fillRect(img, width, width - 4, 8, 2, height - 16, [11, 18, 32, 210]);
  // highlight
  fillRect(img, width, 5, 7, width - 10, 1, [229, 231, 235, 30]);
  outlineRect(img, width, 3, 6, width - 6, height - 12, [31, 41, 55, 220]);
  writePngRGBA(outPath, width, height, img);
}

function genBuildTent(outPath) {
  const width = 34;
  const height = 34;
  const img = makeImage(width, height, P.clear);
  // Base marker
  fillCircle(img, width, 17, 18, 14, [167, 139, 250, 255]);
  strokeCircle(img, width, 17, 18, 14, P.ink);
  // Tent
  fillRect(img, width, 12, 10, 10, 14, [76, 29, 149, 255]);
  fillRect(img, width, 14, 12, 6, 10, [221, 214, 254, 150]);
  // Roof edges
  setPx(img, width, 17, 8, P.ink);
  for (let i = 0; i < 10; i++) {
    setPx(img, width, 12 + i, 10, P.ink);
    setPx(img, width, 12 + i, 23, P.ink);
  }
  outlineRect(img, width, 12, 10, 10, 14, P.ink);
  writePngRGBA(outPath, width, height, img);
}

function genBuildFlag(outPath) {
  const width = 34;
  const height = 34;
  const img = makeImage(width, height, P.clear);
  fillCircle(img, width, 17, 18, 14, [167, 139, 250, 255]);
  strokeCircle(img, width, 17, 18, 14, P.ink);
  // Pole
  fillRect(img, width, 15, 8, 2, 18, [17, 24, 39, 255]);
  // Flag
  fillRect(img, width, 17, 10, 10, 6, [56, 189, 248, 255]);
  fillRect(img, width, 17, 10, 10, 2, [147, 197, 253, 180]);
  outlineRect(img, width, 17, 10, 10, 6, P.ink);
  writePngRGBA(outPath, width, height, img);
}

function genWoodPile(outPath) {
  const width = 34;
  const height = 34;
  const img = makeImage(width, height, P.clear);
  fillCircle(img, width, 17, 27, 10, [0, 0, 0, 40]);
  // logs
  fillRect(img, width, 6, 20, 22, 6, P.wood);
  fillRect(img, width, 8, 13, 18, 6, P.woodHi);
  fillRect(img, width, 10, 22, 14, 5, [154, 52, 18, 255]);
  outlineRect(img, width, 6, 20, 22, 6, P.ink);
  outlineRect(img, width, 8, 13, 18, 6, P.ink);
  outlineRect(img, width, 10, 22, 14, 5, P.ink);
  writePngRGBA(outPath, width, height, img);
}

function genWaterTank(outPath) {
  const width = 34;
  const height = 34;
  const img = makeImage(width, height, P.clear);
  fillCircle(img, width, 17, 27, 10, [0, 0, 0, 40]);
  // Tank body
  fillRect(img, width, 10, 9, 14, 18, [31, 41, 55, 255]);
  fillRect(img, width, 11, 10, 12, 16, [51, 65, 85, 255]);
  outlineRect(img, width, 10, 9, 14, 18, P.ink);
  // Water window
  fillRect(img, width, 13, 17, 8, 7, P.waterA);
  fillRect(img, width, 13, 17, 8, 2, [P.waterHi[0], P.waterHi[1], P.waterHi[2], 110]);
  outlineRect(img, width, 13, 17, 8, 7, P.ink);
  // Cap
  fillRect(img, width, 13, 7, 8, 3, [17, 24, 39, 255]);
  outlineRect(img, width, 13, 7, 8, 3, P.ink);
  writePngRGBA(outPath, width, height, img);
}

function main() {
  const root = process.cwd();

  genTileset32(path.join(root, 'public/assets/tiles/tileset32.png'));
  genLeader32(path.join(root, 'public/assets/chars/leader32.png'));
  genScout32(path.join(root, 'public/assets/chars/scout32.png'));
  genSpark(path.join(root, 'public/assets/ui/spark.png'));
  genShadow(path.join(root, 'public/assets/ui/shadow.png'));
  genRing(path.join(root, 'public/assets/ui/ring.png'));
  genLabelBg(path.join(root, 'public/assets/ui/label_bg.png'));

  genBuildTent(path.join(root, 'public/assets/props/build_tent.png'));
  genBuildFlag(path.join(root, 'public/assets/props/build_flag.png'));
  genWoodPile(path.join(root, 'public/assets/props/wood_pile.png'));
  genWaterTank(path.join(root, 'public/assets/props/water_tank.png'));

  console.log('Generated pixel PNGs in public/assets');
}

main();
