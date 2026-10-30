# chytr.ai — Logo Kit v1

Open-source business OS for AI agents. Mark: a heavy white **c** with an orange **chyt** tile snapping into its opening, on a black rounded square.

## Contents
| Path | What |
|---|---|
| `icon/chytr-app-icon.svg` | App icon, master vector (200×200 viewBox, corner radius 44 = 22%) |
| `icon/chytr-app-icon-{16,32,48,192,512,1024}.png` | App icon PNGs |
| `icon/apple-touch-icon-180.png` | iOS home-screen icon |
| `favicon/favicon.ico` | 16 / 32 / 48 multi-size favicon |
| `wordmark/chytr-wordmark-dark.{svg,png}` | Wordmark, **black text** on transparent (use on light backgrounds) |
| `wordmark/chytr-wordmark-light.{svg,png}` | Wordmark, **white text** on transparent (use on dark backgrounds) |
| `lockup/chytr-lockup-dark.{svg,png}` | Horizontal lockup (icon + wordmark), black text |
| `lockup/chytr-lockup-light.{svg,png}` | Horizontal lockup, white text |
| `source-build_kit.py` | Script that generated every file (fontTools + cairosvg) |

All SVGs have text converted to outlines, so no font install is needed to use them. PNGs have a transparent background (the app icon has transparent corners); wordmark PNGs are 2000 px wide and lockup PNGs 2400 px wide.

> Naming note: here "dark"/"light" refer to the **ink colour** (dark = black text, light = white text). The CloudBeast kit names by *background*; mind the difference.

## Colours
| Name | Hex | RGB | Use |
|---|---|---|---|
| Ink Black | `#000000` | 0 0 0 | Icon field, wordmark on light |
| Paper White | `#FFFFFF` | 255 255 255 | The "c", wordmark on dark |
| Chyt Orange | `#FF4F00` | 255 79 0 | The chyt tile / the dot, ONLY. Never for body text or large fills. |

Max two colours plus orange accent. No gradients, shadows, outlines, or recolouring the tile.

## Typography
- Wordmark: **Geist Mono, weight 800**, lowercase `chytr.ai`, tracking −0.047 em; the period is replaced by a 0.20 em Chyt Orange square (corner radius 0.026 em) sitting on the baseline, with a tightened 0.25 em cell.
- Geist Mono © Vercel, licensed under the **SIL Open Font License 1.1** (free for commercial use, embedding, and modification; you can't sell the font by itself). Source: https://github.com/vercel/geist-font
- Suggested UI/body pairing: Geist (sans) for text, Geist Mono for code/labels.

## Clear space
Let **T** = the side of the orange tile (in the icon: 20% of icon width; in the wordmark: the dot).
- Keep at least **1 T** of empty space on every side of the icon, wordmark and lockup. The PNGs/SVGs already include ~0.1 em padding; clear space is in addition to that when laying out.
- In the lockup, the icon-to-wordmark gap is fixed (0.32 em); don't re-space it.

## Minimum sizes
| Element | Digital | Print |
|---|---|---|
| App icon | 16 px (favicon); prefer ≥ 24 px in UI | 6 mm |
| Wordmark | 80 px wide | 20 mm wide |
| Lockup | 120 px wide | 30 mm wide |
Below 120 px wide, use the icon alone.

## Don'ts
- Don't set "chytr.ai" in a live font as a substitute for the wordmark; use the outlined SVG.
- Don't capitalise (never "Chytr.ai" / "CHYTR.AI" in the logo).
- Don't move the tile inside the c, rotate, stretch, or change its colour.
- On pure-black backgrounds the icon's black field disappears; that's acceptable (the c + tile carry it), but prefer a background of #111 or lighter if the square shape matters.
