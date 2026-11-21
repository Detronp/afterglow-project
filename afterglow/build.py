"""Tiny static site generator: YAML content + Jinja2 templates -> dist/.

    python build.py            # build into ./dist
    python build.py --serve    # build, then serve on http://localhost:8000

Static assets get a content hash in their file name (style.3f2a9c1b.css), so
Nginx can cache them "forever" and a new deploy still busts the cache.
"""

import argparse
import functools
import hashlib
import http.server
import shutil
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).parent
DIST = ROOT / "dist"


def fingerprint_assets() -> dict[str, str]:
    """Copy static/* to dist/assets/ with hashed names; return {original: hashed}."""
    out = DIST / "assets"
    out.mkdir(parents=True)
    manifest = {}
    for src in sorted((ROOT / "static").iterdir()):
        digest = hashlib.sha256(src.read_bytes()).hexdigest()[:8]
        hashed = f"{src.stem}.{digest}{src.suffix}"
        shutil.copy2(src, out / hashed)
        manifest[src.name] = f"/assets/{hashed}"
    return manifest


def build() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    site = yaml.safe_load((ROOT / "content" / "site.yaml").read_text())
    assets = fingerprint_assets()

    env = Environment(
        loader=FileSystemLoader(ROOT / "templates"),
        autoescape=select_autoescape(),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.globals["asset"] = lambda name: assets[name]

    for page in ("index.html", "404.html"):
        html = env.get_template(page).render(site=site)
        (DIST / page).write_text(html)

    print(f"Built {len(list(DIST.rglob('*')))} files into {DIST.relative_to(ROOT)}/")


def serve(port: int) -> None:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=DIST)
    print(f"Serving on http://localhost:{port}  (Ctrl+C to stop)")
    http.server.ThreadingHTTPServer(("", port), handler).serve_forever()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    build()
    if args.serve:
        serve(args.port)
