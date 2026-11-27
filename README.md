# QuFi mining

The public page that explains how Palm nodes mine $Q by staying online: one $Q per online node per day, for ten years, at most 73 million $Q, matching the 7.3 million $Q bought back and burnt each year.

It is a single static page built with qufi.network's own layout, stylesheet, scripts and icons, so it looks and behaves like the rest of the site.

## Editing

The page content lives in `src/content.mjs`. Page-only styles (the white surface and the hero phones) are in `assets/css/mining.css`.

To rebuild `index.html`, check out the qufi.network site source next to this folder as `qufi-protocol`, then run:

```
node src/build.mjs
```

The build renders the page with the site's layout, points the header and footer links at https://qufi.network/, and copies the shared assets into `assets/`.

Planned design, November 2026. Details may change before launch.
