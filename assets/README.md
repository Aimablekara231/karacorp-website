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
  brand/
    karacorp-logo.png
  karaskin/
    clarity-cleanser.jpg
    glow-renewal-serum.jpg
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

- `assets/brand/karacorp-logo.png`
- `assets/karaskin/`
- `assets/founders/aimable.jpg`
- `assets/founders/vivian.jpg`
- `assets/ventures/consulting-hero.jpg`
- `assets/ventures/travel-hero.jpg`
- `assets/places/office.jpg`

These files are already referenced in the site code. Replace them with your final images and keep the same names.

## Official logo workflow

Place the official KaraCorp PNG logo here:

- `assets/brand/karacorp-logo.png`

What happens:
- the header and footer brand areas switch to the official logo automatically
- the favicon, Open Graph image, and structured logo reference use the same file path
- if the file is missing, the website keeps the current `KC` fallback mark until you add the PNG

## KaraSkin storefront workflow

The new `KaraSkin` page renders products from:

- `js/karaskin-products.js`

Product photos can be kept in:

- `assets/karaskin/`

That means:
- product structure can stay in the data file for now
- images can be added later without redesigning the storefront

## Guidelines

- Keep file names lowercase.
- Use JPG or WebP for photography.
- Use SVG for logos and icons where appropriate.
- Crop founder photos vertically with a clean portrait composition.
- Use wide landscape images for consulting, travel, and office visuals.
- Avoid extremely large files; compress before pushing.
