# KaraCorp Website Assets

This folder holds the images and brand files used by `karacorp.org`.

## Simple update workflow

1. Add or replace an image file in the correct folder below.
2. Keep the exact filename.
3. Push the repo to GitHub.
4. Cloudflare Pages or Render redeploys and the live site updates.

## Folder structure

```text
assets/
  founders/
    aimable.jpg
    vivian.jpg
  ventures/
    consulting-hero.jpg
    travel-hero.jpg
  places/
    office.jpg
```

## Active image hooks

- `assets/founders/aimable.jpg`
- `assets/founders/vivian.jpg`
- `assets/ventures/consulting-hero.jpg`
- `assets/ventures/travel-hero.jpg`
- `assets/places/office.jpg`

These files are already referenced in `css/styles.css`. Replace them with your final images and keep the same names.

## Guidelines

- Keep file names lowercase.
- Use JPG or WebP for photography.
- Use SVG for logos and icons where appropriate.
- Crop founder photos vertically with a clean portrait composition.
- Use wide landscape images for consulting, travel, and office visuals.
- Avoid extremely large files; compress before pushing.
