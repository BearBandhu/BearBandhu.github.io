# Alejandro Melian — Game Design Portfolio

Static site. No build step, no dependencies to install.

## Publish on GitHub Pages

1. Create a new repository on GitHub (public). If you name it `<your-username>.github.io` the site lives at that root domain; any other name puts it at `<your-username>.github.io/<repo>/`.
2. Upload every file in this folder to the repository root, including the `.nojekyll` dotfile. (GitHub's drag-and-drop upload works; so does `git push`.)
3. Repo → **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main`, Folder: `/ (root)` → **Save**.
4. Wait ~1 minute. The URL appears at the top of that Settings → Pages screen.

`.nojekyll` matters: without it GitHub runs Jekyll, which can skip files it doesn't recognise.

## Updating it later

Replace the changed files in the repo (web UI: *Add file → Upload files*, or `git add . && git commit && git push`). Pages redeploys on every push to `main`.

## Custom domain

Settings → Pages → Custom domain. Then at your registrar add a CNAME record pointing to `<your-username>.github.io`, or four A records to GitHub's IPs (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`).

## What's here

- `index.html` — the home page and entry point
- `project-*.html` — write-ups for shipped titles and jam games
- `prototype-*.html` — prototype write-ups, each embedding a playable build
- `proto-*.html` — the playable builds themselves (loaded in iframes)
- `art/`, `assets/lylyland/`, `assets/shots/` — images
- `*.css`, `*.js` — styles and behaviour (scroll deck, slime companion, contact button)
