# ✦ AFTERGLOW: a festival site, built with Python and served by Nginx

A bold, animated landing page for a made-up desert music festival.

**How it works:** Python is used only while the image builds. `build.py` combines
`content/site.yaml` with Jinja2 templates to produce plain HTML. The final image is just
Nginx and those files: no Python runtime, about 50 MB, running as a non-root user with a
read-only filesystem.

```
content/site.yaml ─┐
templates/*.html  ─┼─▶ build.py ─▶ dist/ ─▶ nginx (final image)
static/*.css|js   ─┘   (hashes asset names for caching)
```

## What's on the page
- A huge animated title with a shimmering gradient; letters wobble when you hover over them
- A glowing gradient blob that follows your cursor, plus a film-grain overlay
- A live countdown to opening night
- A tilted, scrolling ticker of highlights
- A grid of lineup cards that tilt in 3D and light up where your cursor is
- Ticket cards, with buttons that lean toward the cursor
- Sections that fade in as you scroll; all motion turns off when the visitor has "reduced motion" set

## Run it with Docker
```bash
docker compose up -d --build
# open http://localhost:8080
```
or without Compose:
```bash
docker build -t afterglow .
docker run -d -p 8080:8080 afterglow
```

## Change the content
Everything (lineup, dates, tickets, ticker text) is in `content/site.yaml`. Edit it, then
`docker compose up -d --build`.

## Develop locally
```bash
pip install -r requirements.txt
python build.py --serve      # http://localhost:8000
```

## Caching
Asset files are renamed with a hash of their contents (e.g. `style.1a2b3c4d.css`). Nginx tells
browsers to cache them for a year, while HTML is always rechecked. Visitors get fast repeat
loads, and a new deploy still shows up immediately.
