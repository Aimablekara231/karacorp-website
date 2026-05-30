# KaraCorp Deployment Guide

This website is a static site. The simplest workflow is:

1. Update content or images locally.
2. Commit and push to GitHub.
3. Your hosting provider redeploys automatically.

## Image workflow

Use these exact files:

- `assets/founders/aimable.jpg`
- `assets/founders/vivian.jpg`
- `assets/ventures/consulting-hero.jpg`
- `assets/ventures/travel-hero.jpg`
- `assets/places/office.jpg`

Replace the files, push to GitHub, and the new images appear after deployment.

## Cloudflare Pages

1. Put this repository on GitHub.
2. In Cloudflare, go to `Workers & Pages`.
3. Create a new Pages project from GitHub.
4. Select this repository and the production branch.
5. Because this is a plain static site, use:
   - Build command: leave empty
   - Build output directory: `/`
6. Deploy.
7. In the project, open `Custom domains`.
8. Add:
   - `karacorp.org`
   - `www.karacorp.org` if needed
9. Keep `_redirects` in the repo root so Cloudflare applies the route rules.
10. The founder pages are already available at:
   - `https://karacorp.org/aimable`
   - `https://karacorp.org/vivian`
11. If you want NFC cards to use `aimable.karacorp.org` and `vivian.karacorp.org`, create Cloudflare redirect rules that send those subdomains to the paths above, or create separate Pages projects later if you want the browser to stay on the subdomain.

## Render Static Site

1. Put this repository on GitHub.
2. In Render, create `New > Static Site`.
3. Connect the repository.
4. Use:
   - Build command: leave empty
   - Publish directory: `.`
5. Deploy.
6. Add custom domains in the Render dashboard:
   - `karacorp.org`
   - `www.karacorp.org` if needed
7. Follow the DNS values Render gives you, then verify the domains in Render.
8. Use these ready-to-share founder URLs:
   - `https://karacorp.org/aimable`
   - `https://karacorp.org/vivian`
9. If you later want subdomain taps for founders, use DNS plus a redirect layer or separate deployments for those founder pages.

## Recommendation

Use Cloudflare Pages for the main corporate site if you want the cleanest fit with the current `_redirects` file and subdomain routing setup.
