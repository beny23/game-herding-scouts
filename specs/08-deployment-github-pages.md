# 08 — Deployment on GitHub Pages (Static Site)

This project is designed to deploy as a **static site** to **GitHub Pages** using **GitHub Actions**.

## Approach
- Build the web app with Vite (`dist/` output)
- Upload the build artifact
- Deploy to GitHub Pages via Actions

## Requirements
- Repository hosted on GitHub
- GitHub Pages enabled (Deploy from Actions)

## Recommended Setup
### Vite base path
For GitHub Pages, links and assets must resolve correctly under a subpath.

To avoid needing the repo name, use a **relative base** in Vite:
- `base: './'`

This works well for a single-page game that doesn’t rely on client-side routing.

## GitHub Pages configuration
In your GitHub repo:
- Settings → Pages
- Source: **GitHub Actions**

## Deployment workflow (high level)
A workflow should:
1. Check out code
2. Install dependencies
3. Run `npm run build`
4. Upload `dist/`
5. Deploy to Pages

## Notes / Gotchas
- If you later add multiple routes (not typical for a Phaser game), prefer `base: '/<repo>/'` and ensure routing works.
- Prefer placing game assets under `public/` (Vite copies them as-is).
