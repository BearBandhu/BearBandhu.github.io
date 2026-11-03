repo: BearBandhu/BearBandhu.github.io
branch: main

## Last sync
date: 2026-08-24T19:24:25Z
direction: read-only (I can browse the repo; pushing is done by you)

### Updated in this project
- Prototype rail cards now use the six key-art banners (Belowlite, Wanderfull, Gridlite, The Last Piece, Flowermonger, Salvager).
- Screenshots baked into real files under `assets/shots/` — no image-slot drop targets, no state sidecar.
- Contact CTA on every project/prototype page: copies the address, lands on the contact section.
- Mobile: tall panels scroll internally before paging; footer clears the screen edge.

### Not yet in the repo
- `depth.js` + `depth.css` — the inner-scroll fix for tall panels on phones (repo copy has the speed tuning but not `absorbs()`).
- `image-slot.js` and `.image-slots.state.json` are still in the repo and can be deleted.

## Screen map
| Project screen | Repo files |
| --- | --- |
| Home (scroll deck) | index.html, depth.css, depth.js, achievements.js, slime-lab.js, slime-palettes.js, art/* |
| Shipped title pages | project-*.html, subpage.css, slime.css, slime-companion.js, contact-cta.js, assets/shots/*, assets/lylyland/* |
| Prototype write-ups | prototype-*.html, subpage.css, slime.css, slime-companion.js, contact-cta.js |
| Playable builds | proto-*.html, proto-last-piece.jsx |
