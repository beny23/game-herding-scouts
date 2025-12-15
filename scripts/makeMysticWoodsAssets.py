#!/usr/bin/env python3
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "gamepacks" / "mystic_woods" / "sprites"
OUT_TILES = ROOT / "public" / "assets" / "tiles" / "mystic_woods_tileset16.png"
OUT_LEADER = ROOT / "public" / "assets" / "chars" / "leader32.png"
OUT_SCOUT = ROOT / "public" / "assets" / "chars" / "scout32.png"


@dataclass(frozen=True)
class TileStat:
    sheet: Path
    index: int
    x: int
    y: int
    alpha_cov: float
    r: float
    g: float
    b: float
    bright: float
    sat: float
    green: float
    blue: float
    brown: float


def _iter_tiles(img: Image.Image, tile: int) -> Iterable[tuple[int, int, Image.Image]]:
    w, h = img.size
    cols = w // tile
    rows = h // tile
    for ty in range(rows):
        for tx in range(cols):
            x0 = tx * tile
            y0 = ty * tile
            crop = img.crop((x0, y0, x0 + tile, y0 + tile))
            yield tx, ty, crop


def _stats_for_tile(sheet_path: Path, idx: int, tx: int, ty: int, tile_img: Image.Image) -> TileStat:
    rgba = tile_img.convert("RGBA")
    px = list(rgba.getdata())
    n = len(px)

    a_sum = 0
    r_sum = 0
    g_sum = 0
    b_sum = 0
    solid = 0

    for (r, g, b, a) in px:
        a_sum += a
        if a >= 200:
            solid += 1
            r_sum += r
            g_sum += g
            b_sum += b

    alpha_cov = solid / n
    if solid == 0:
        r_avg = g_avg = b_avg = 0.0
    else:
        r_avg = r_sum / solid
        g_avg = g_sum / solid
        b_avg = b_sum / solid

    bright = (r_avg + g_avg + b_avg) / 3.0
    mx = max(r_avg, g_avg, b_avg)
    mn = min(r_avg, g_avg, b_avg)
    sat = 0.0 if mx < 1e-6 else (mx - mn) / mx

    green = g_avg - (r_avg + b_avg) * 0.5
    blue = b_avg - (r_avg + g_avg) * 0.5
    brown = ((r_avg + g_avg) * 0.5) - b_avg

    return TileStat(
        sheet=sheet_path,
        index=idx,
        x=tx,
        y=ty,
        alpha_cov=alpha_cov,
        r=r_avg,
        g=g_avg,
        b=b_avg,
        bright=bright,
        sat=sat,
        green=green,
        blue=blue,
        brown=brown,
    )


def _collect_stats(sheet_path: Path, tile: int) -> tuple[Image.Image, list[TileStat]]:
    img = Image.open(sheet_path).convert("RGBA")
    stats: list[TileStat] = []
    idx = 0
    for tx, ty, crop in _iter_tiles(img, tile):
        stats.append(_stats_for_tile(sheet_path, idx, tx, ty, crop))
        idx += 1
    return img, stats


def _pick_best(stats: list[TileStat], predicate, score_fn) -> TileStat:
    candidates = [s for s in stats if predicate(s)]
    if not candidates:
        raise RuntimeError("No candidates matched predicate")
    return max(candidates, key=score_fn)


def _crop_tile(img: Image.Image, tile: int, index: int) -> Image.Image:
    cols = img.size[0] // tile
    tx = index % cols
    ty = index // cols
    x0 = tx * tile
    y0 = ty * tile
    return img.crop((x0, y0, x0 + tile, y0 + tile)).convert("RGBA")


def _crop_tiles(img: Image.Image, tile: int, indices: list[int]) -> list[Image.Image]:
        return [_crop_tile(img, tile, idx) for idx in indices]


def _within_tol(a: int, b: int, tol: int) -> bool:
    return abs(a - b) <= tol


def _clear_corner_background(tile_img: Image.Image, tol: int = 8) -> Image.Image:
    """Clear a solid background color by flood-filling from the 4 corners.

    This is designed for tiles that have an opaque "boxed" background color.
    We sample the corner colors and remove only the connected region from each corner,
    preserving internal outlines/details even if they share the same color elsewhere.
    """

    img = tile_img.convert("RGBA")
    w, h = img.size
    px = img.load()
    visited = [[False] * h for _ in range(w)]

    def flood_from(sx: int, sy: int):
        if sx < 0 or sy < 0 or sx >= w or sy >= h:
            return
        if visited[sx][sy]:
            return

        r0, g0, b0, a0 = px[sx, sy]
        if a0 < 250:
            return

        stack = [(sx, sy)]
        while stack:
            x, y = stack.pop()
            if x < 0 or y < 0 or x >= w or y >= h:
                continue
            if visited[x][y]:
                continue
            visited[x][y] = True

            r, g, b, a = px[x, y]
            if a < 250:
                continue
            if not (_within_tol(r, r0, tol) and _within_tol(g, g0, tol) and _within_tol(b, b0, tol)):
                continue

            # Clear background pixel
            px[x, y] = (r, g, b, 0)

            stack.append((x + 1, y))
            stack.append((x - 1, y))
            stack.append((x, y + 1))
            stack.append((x, y - 1))

    flood_from(0, 0)
    flood_from(w - 1, 0)
    flood_from(0, h - 1)
    flood_from(w - 1, h - 1)
    return img


def _matte_over(base: Image.Image, fg: Image.Image) -> Image.Image:
    b = base.convert("RGBA")
    f = fg.convert("RGBA")
    if b.size != f.size:
        raise ValueError("Base/foreground size mismatch")
    out = b.copy()
    out.alpha_composite(f)
    return out


def _tint_water(tile_img: Image.Image) -> Image.Image:
    """Shift a tile toward a brighter blue while preserving shading."""
    img = tile_img.convert("RGBA")
    w, h = img.size
    px = img.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue

            # Reduce warm tones, boost blue. Keep within [0,255].
            nr = int(r * 0.55)
            ng = int(g * 0.70)
            nb = int(min(255, b * 1.55 + 35))
            # Slight lift to avoid muddy water.
            lift = 8
            nr = min(255, nr + lift)
            ng = min(255, ng + lift)
            nb = min(255, nb + lift)
            px[x, y] = (nr, ng, nb, a)
    return img


def build_tileset16() -> None:
    water_paths = [
        PACK / "tilesets" / "water1.png",
        PACK / "tilesets" / "water2.png",
        PACK / "tilesets" / "water3.png",
        PACK / "tilesets" / "water4.png",
        PACK / "tilesets" / "water5.png",
        PACK / "tilesets" / "water6.png",
    ]
    decor_path = PACK / "tilesets" / "decor_16x16.png"
    objects_path = PACK / "objects" / "objects.png"

    for p in [*water_paths, decor_path, objects_path]:
        if not p.exists():
            raise FileNotFoundError(str(p))

    water_sheets: list[tuple[Path, Image.Image, list[TileStat]]] = []
    for wp in water_paths:
        wimg, wstats = _collect_stats(wp, 16)
        water_sheets.append((wp, wimg, wstats))

    # Flatten stats with a lookup back to the owning sheet.
    water_stats_with_img: list[tuple[TileStat, Image.Image]] = []
    for _, img, st in water_sheets:
        for s in st:
            water_stats_with_img.append((s, img))

    decor_img = Image.open(decor_path).convert("RGBA")
    objects_img, objects_stats = _collect_stats(objects_path, 16)

    # User-chosen tiles (by sheet index) from the tile picker page.
    grass_src = [0, 1, 2, 3]
    clearing_src = [4, 5, 7, 12, 13, 14, 15]
    path_src = [6]

    tree_quad_src = [118, 119, 134, 135]  # TL, TR, BL, BR
    stump_quad_src = [122, 123, 138, 139]  # TL, TR, BL, BR

    # Use a grass tile as the matte/background for object tiles to avoid boxed black backgrounds.
    grass_matte = _crop_tile(decor_img, 16, grass_src[0])

    # Water: pick a brighter, more saturated blue tile across water1..water6.
    # This helps the river read as "water" rather than a dark band.
    water_stat, water_img = max(
        (pair for pair in water_stats_with_img if pair[0].alpha_cov > 0.35),
        key=lambda pair: (pair[0].blue * 2.0 + pair[0].sat * 80.0 + pair[0].bright * 0.25),
    )

    # Rock: keep a heuristic "gray-ish" rock tile from objects.png.
    rock = _pick_best(
        objects_stats,
        predicate=lambda s: s.alpha_cov > 0.5 and s.sat < 0.30 and s.bright > 30,
        score_fn=lambda s: ((1.0 - s.sat) * 100, s.bright),
    )

    tiles: list[Image.Image] = []
    tiles += _crop_tiles(decor_img, 16, grass_src)
    tiles += _crop_tiles(decor_img, 16, clearing_src)
    tiles += _crop_tiles(decor_img, 16, path_src)
    tiles.append(_tint_water(_crop_tile(water_img, 16, water_stat.index)))

    rock_tile = _crop_tile(objects_img, 16, rock.index)
    rock_tile = _clear_corner_background(rock_tile, tol=8)
    tiles.append(_matte_over(grass_matte, rock_tile))

    tree_tiles = _crop_tiles(objects_img, 16, tree_quad_src)
    tree_tiles = [_matte_over(grass_matte, _clear_corner_background(t, tol=8)) for t in tree_tiles]
    tiles += tree_tiles

    stump_tiles = _crop_tiles(objects_img, 16, stump_quad_src)
    stump_tiles = [_matte_over(grass_matte, _clear_corner_background(t, tol=8)) for t in stump_tiles]
    tiles += stump_tiles

    out = Image.new("RGBA", (16 * len(tiles), 16), (0, 0, 0, 0))
    for i, t in enumerate(tiles):
        out.paste(t, (i * 16, 0))

    OUT_TILES.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT_TILES)


def build_char_images() -> None:
    player_path = PACK / "characters" / "player.png"
    slime_path = PACK / "characters" / "slime.png"
    if not player_path.exists():
        raise FileNotFoundError(str(player_path))
    if not slime_path.exists():
        raise FileNotFoundError(str(slime_path))

    # Player is 48x48 grid (doc says that); take first frame (top-left) and downscale to 32.
    player = Image.open(player_path).convert("RGBA")
    leader48 = player.crop((0, 0, 48, 48))
    leader32 = leader48.resize((32, 32), resample=Image.NEAREST)

    # Slime is 32x32 grid; take first frame (top-left) as scout.
    slime = Image.open(slime_path).convert("RGBA")
    scout32 = slime.crop((0, 0, 32, 32))

    OUT_LEADER.parent.mkdir(parents=True, exist_ok=True)
    leader32.save(OUT_LEADER)

    OUT_SCOUT.parent.mkdir(parents=True, exist_ok=True)
    scout32.save(OUT_SCOUT)


def main() -> None:
    build_tileset16()
    build_char_images()
    print("Wrote:")
    print(f"- {OUT_TILES.relative_to(ROOT)}")
    print(f"- {OUT_LEADER.relative_to(ROOT)}")
    print(f"- {OUT_SCOUT.relative_to(ROOT)}")


if __name__ == "__main__":
    # Avoid Pillow debug noise.
    os.environ.setdefault("PYTHONWARNINGS", "ignore")
    main()
