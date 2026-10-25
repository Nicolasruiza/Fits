# Fits v5 — handoff for Claude Code

New Looks, Wardrobe and Stats pages, built against `main` at commit `6778e36`. They follow the same design rules:

- Two tabs with counts.
- One chip row as the only filter.
- A favorites or wishlist row on top.
- A sort toggle next to the section title.
- Photo-first cards with one label.
- Hidden items behind a quiet link at the bottom.

Nicolas is refactoring the app, so **port these onto the refactored code** rather than applying the files blindly.

## Status

| Part | State |
|---|---|
| Looks (`looks.html`, `looks-v5.js`) and Best next buy (`next-buy.html`, `next-buy.js`) | Tested in a phone-size browser, no console errors |
| Wardrobe (`wardrobe-v5.*`), piece page (`piece-v5.*`), Stats (`stats-v5.*`), `ui-switch.js` | Written and syntax-checked, **not yet tested in a browser** |

## Files

| File | What it does |
|---|---|
| `looks-v5-core.js` | Shared logic, exposed as `window.FITS_V5`: readiness (missing pieces after swaps), auto season from the 7-day forecast (one-day override), auto occasion (weekday = Office, weekend = Weekend), family cards, Best next buy ranking, piece kind and season fit, wear records, log/unlog wear, shared bottom nav, small local event log for the A/B comparison |
| `looks-v5.css` | All v5 styles (Looks, Best next buy, Wardrobe `w5-*`, piece `p5-*`, Stats `s5-*`) |
| `looks.html` + `looks-v5.js` | Looks: weather card with one-line season and a Change panel, Ready / Inspiration tabs, occasion chips, favorites row, Warmer/Colder sort, image-only grid, Inspiration grouped 1 / 2 / 3+ pieces away with a "Needs …" label, Best next buy card, `?view=hidden` |
| `next-buy.html` + `next-buy.js` | Best next buy page for `?piece=id` (defaults to #1). `&from=wardrobe` sends the back link to Wardrobe |
| `wardrobe-v5.html` + `wardrobe-v5.js` | Wardrobe: Owned / Missing tabs, category chips, favorites row (Owned) and wishlist row (Missing), Most/Least worn and Unlocks most/In most looks sorts, Best next buy card, out-of-season pieces dimmed and moved last, `?view=hidden`, `?status=missing` |
| `piece-v5.html` + `piece-v5.js` | Piece page `?id=`: star, I own it / Missing switch (replaces the checkbox on photos), impact numbers, ready / one-away rows, Find to buy, swaps list with an "Edit swaps" link to the classic `piece.html?id=…&classic=1`, hide / unhide |
| `stats-v5.html` + `stats-v5.js` | Stats: month card with a photo strip of the last 7 days and a month picker, Looks / Pieces tabs, Wear next card (logs today, with undo), forgotten favorites, All worn with Most worn / Longest ago, closet usage, plain-words insight, "Owned, not worn yet", Working hardest, `?view=history` with undo |
| `ui-switch.js` | Loaded in the `<head>` of the classic `wardrobe.html`, `stats.html` and `piece.html`. Sends them to their v5 page unless the UI choice is classic |
| `index.html` (small edit) | Same switch for Looks: `DEFAULT_UI='v5'`; `?ui=classic` / `?ui=v5` is remembered per device |

## Dependencies (globals the v5 code reads)

- `window.FITS_DATA` (`looks`, `pieces`, `families`), after the data / canonical / integrity scripts.
- `window.FITS_CLIMATE` (`climate-rules.js`) and `season-meta.js`, which sets `look.climate` and `look.seasons`.
- `window.FITS_SWAPS` (`closet-swaps.js`).
- Piece photos from `window.PIECE_IMAGES` (populated by `piece-image-overrides.js`; each v5 page declares `var PIECE_IMAGES` first) or `window.FITS_CATALOG_IMAGES`.

The v5 HTML pages load the same data script list `index.html` used on `6778e36`. After the refactor, swap that list for whatever the new data entry point is.

## Storage keys (unchanged, so saved data carries over)

- Existing keys: `fitsWardrobe`, `fitsClosetSwaps`, `fitsSavedVariants` (look favorites), `fitsHiddenLooks`, `fitsWishlistPieces` (the piece star: reads as a favorite on owned pieces and a wish on missing ones), `fitsHiddenPieces`, `fitsWearHistory` (`{lookId:[YYYY-MM-DD]}`), `fitsWeatherHome` (v5 adds a `week` array), `fitsWeatherCoords`, `fitsInterchangeable`, `fitsRejectedSwaps`.
- New keys: `fitsUI`, `fitsSeasonV5`, `fitsOccasionV5`, `fitsWarmthSortV5`, `fitsWardSortOwned`, `fitsWardSortMissing`, `fitsStatsSortLooks`, `fitsStatsSortPieces`, `fitsV5Events`.

## To do

1. Port onto the refactored structure: one data entry point, and merge `looks-v5-core.js` into whatever shared module the refactor creates.
2. Serve locally and test at iPhone size: `looks.html`, `next-buy.html`, `wardrobe-v5.html` (both tabs, category chips, See all), `piece-v5.html?id=beige-chinos` and `?id=light-blue-oxford` (owned switch, star, hide), `stats-v5.html` (both tabs, Wear today + undo, month picker, `?view=history` undo). Check the console has no errors.
3. Check the redirects: `wardrobe.html`, `stats.html`, `piece.html?id=x` and `detail.html` → "View in Wardrobe" should land on the v5 pages. `index.html?ui=classic` should bring the classic app back.
4. Open a PR to `main`.
