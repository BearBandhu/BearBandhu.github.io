/* ============================================================
   PORTFOLIO SHELL — am.melian/2026
   Vanilla JS. Drop on any page. Owns:
   - localStorage state for visits, achievements, scroll resume
   - top progress bar (% of portfolio explored)
   - command palette (Cmd/Ctrl-K)
   - achievement toasts + bottom-left panel
   - easter eggs (konami, logo-click)
   ============================================================ */

(function () {
  "use strict";

  // -------- STORAGE --------
  const KEY = "am.portfolio.v1";
  const DEFAULT_STATE = {
    visits: {},          // pageId -> count
    sectionsSeen: {},    // sectionId -> true
    achievements: {},    // achId -> timestamp
    scroll: {},          // pageId -> {y, pct}
    konami: false,
    deepMode: true,
    logoClicks: 0,
    secretsFound: {},
  };
  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULT_STATE };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }
  function saveState() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }
  const state = loadState();

  // -------- CATALOG --------
  // Pages and their sections; used for % explored calculation + cmd-K
  const CATALOG = {
    pages: [
      { id: "home", title: "Index — game design", path: "index.html", file: "~/portfolio/index.html" },
      { id: "proto-qte", title: "Prototype · QTE combat (playable)", path: "prototype-qte-combat.html", file: "~/prototypes/qte-combat.md" },
      { id: "proto-meadow", title: "Prototype · Cozy meadow (playable)", path: "prototype-cozy-meadow.html", file: "~/prototypes/cozy-meadow.md" },
      { id: "proto-lastpiece", title: "Prototype · The Last Piece (playable)", path: "prototype-last-piece.html", file: "~/prototypes/the-last-piece.md" },
      { id: "proto-gnome", title: "Prototype · Gnome Garden Defense (playable)", path: "prototype-gnome-garden.html", file: "~/prototypes/gnome-garden.md" },
      { id: "proto-sonar", title: "Prototype · Sonar Salvage (playable)", path: "prototype-sonar-salvage.html", file: "~/prototypes/sonar-salvage.md" },
      { id: "proto-caravan", title: "Prototype · Caravan Defense (playable)", path: "prototype-caravan-defense.html", file: "~/prototypes/caravan-defense.md" },
      { id: "product", title: "Archive · product-design portfolio", path: "product-design.html", file: "~/archive/product.html" },
      { id: "innova", title: "Mobile EdTech companion · at Innova Schools", path: "case-innova.html", file: "~/work/03-innova.md" },
      { id: "lyly", title: "B2C app in a 3-product ecosystem · at Lyly", path: "case-lyly.html", file: "~/work/02-lyly.md" },
      { id: "edenic", title: "Core game systems · at Edenic Era", path: "case-edenic.html", file: "~/work/01-edenic.md" },
    ],
    sections: {
      home: ["hero", "work", "prototypes", "about", "product", "contact"],
      "proto-qte": ["hero", "design", "systems", "play", "contact"],
      "proto-meadow": ["hero", "design", "systems", "play", "contact"],
      "proto-lastpiece": ["hero", "design", "systems", "play", "contact"],
      "proto-gnome": ["hero", "design", "systems", "play", "contact"],
      "proto-sonar": ["hero", "play", "design", "systems", "contact"],
      "proto-caravan": ["hero", "play", "design", "systems", "contact"],
      product: ["hero", "principles", "index-table", "now", "contact"],
      innova: ["tldr", "problem", "research", "system", "outcome", "next"],
      lyly: ["tldr", "problem", "research", "system", "outcome", "next"],
      edenic: ["tldr", "problem", "research", "system", "outcome", "next"],
    },
  };

  const ACHIEVEMENTS = [
    { id: "first-step", title: "FIRST PRINT", desc: "Open the portfolio for the first time." },
    { id: "command-line", title: "POWER USER", desc: "Open the command palette (⌘K)." },
    { id: "skim-or-deep", title: "TWO SPEEDS", desc: "Toggle between skim & deep mode." },
    { id: "all-cases", title: "COMPLETIONIST", desc: "Visit all three case studies." },
    { id: "deep-reader", title: "DEEP READER", desc: "Scroll to the end of any case study." },
    { id: "konami", title: "OLD SCHOOL", desc: "Enter ↑ ↑ ↓ ↓ ← → ← → B A on the keyboard." },
    { id: "logo-tap", title: "RUBBER STAMP", desc: "Click the logomark five times." },
    { id: "footnote", title: "MARGINALIA", desc: "Find a footnote tucked in a case study." },
  ];

  // -------- HELPERS --------
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      } else if (attrs[k] !== false && attrs[k] != null) {
        node.setAttribute(k, attrs[k]);
      }
    }
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function $(sel, root = document) {
    return root.querySelector(sel);
  }
  function $$(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  // -------- EVENTS --------
  const listeners = {};
  function on(name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
  }
  function emit(name, payload) {
    (listeners[name] || []).forEach((fn) => fn(payload));
  }

  // -------- CORE: progress + visits + achievements --------
  function totalUnits() {
    let n = 0;
    for (const p of CATALOG.pages) n += (CATALOG.sections[p.id] || []).length;
    return n || 1;
  }
  function seenUnits() {
    let n = 0;
    for (const p of CATALOG.pages) {
      for (const s of CATALOG.sections[p.id] || []) {
        if (state.sectionsSeen[`${p.id}/${s}`]) n++;
      }
    }
    return n;
  }
  function percentExplored() {
    return Math.round((seenUnits() / totalUnits()) * 100);
  }

  function unlock(id) {
    if (state.achievements[id]) return false;
    state.achievements[id] = Date.now();
    saveState();
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (ach) showToast(ach);
    emit("achievement", id);
    renderProgress();
    renderPanel();
    return true;
  }

  function markSection(pageId, sectionId) {
    const key = `${pageId}/${sectionId}`;
    if (state.sectionsSeen[key]) return;
    state.sectionsSeen[key] = true;
    saveState();
    renderProgress();
    // completionist check
    const allVisited = CATALOG.pages
      .filter((p) => p.id !== "home")
      .every((p) => state.visits[p.id]);
    if (allVisited) unlock("all-cases");
  }

  function markVisit(pageId) {
    state.visits[pageId] = (state.visits[pageId] || 0) + 1;
    saveState();
    if (Object.keys(state.visits).length >= 1) unlock("first-step");
  }

  // -------- TOAST --------
  function ensureToastStack() {
    let stack = $(".toast-stack");
    if (!stack) {
      stack = el("div", { class: "toast-stack" });
      document.body.appendChild(stack);
    }
    return stack;
  }
  function showToast({ title, desc, kicker = "ACHIEVEMENT UNLOCKED" }) {
    const stack = ensureToastStack();
    const node = el("div", { class: "toast", role: "status" }, [
      el("div", { class: "toast__rail" }),
      el("div", { class: "toast__body" }, [
        el("div", { class: "toast__kicker" }, kicker),
        el("div", { class: "toast__title" }, title),
        el("div", { class: "toast__desc" }, desc || ""),
      ]),
    ]);
    stack.appendChild(node);
    setTimeout(() => {
      node.style.transition = "opacity 220ms, transform 220ms";
      node.style.opacity = "0";
      node.style.transform = "translateX(20px)";
      setTimeout(() => node.remove(), 240);
    }, 4200);
  }

  // -------- TOP PROGRESS + READING METER --------
  function renderProgress() {
    const bar = $(".shell-progress__bar");
    if (bar) {
      // reading meter on this page if data-reading-target present
      const target = $("[data-reading-target]");
      if (target) {
        const total = target.scrollHeight - window.innerHeight;
        const pct = total > 0
          ? Math.max(0, Math.min(1, (window.scrollY) / total)) * 100
          : 0;
        bar.style.width = pct + "%";
      } else {
        bar.style.width = percentExplored() + "%";
      }
    }
    // progress label updates
    $$(".js-progress-pct").forEach((n) => (n.textContent = percentExplored() + "%"));
    $$(".js-progress-ring").forEach((n) => (n.style.setProperty("--p", percentExplored() + "%")));
    $$(".js-progress-frac").forEach((n) => (n.textContent = `${seenUnits()}/${totalUnits()}`));
    $$(".js-ach-count").forEach(
      (n) => (n.textContent = `${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}`)
    );
  }

  // -------- ACHIEVEMENT PANEL --------
  let panelOpen = false;
  function renderPanel() {
    const wrap = $("#ach-panel-root");
    if (!wrap) return;
    wrap.innerHTML = "";
    if (!panelOpen) {
      const launcher = el(
        "button",
        { class: "ach-launcher", "aria-label": "Open achievements" },
        [
          el("span", { class: "ach-launcher__dot" }),
          el(
            "span",
            {},
            `ACHIEVEMENTS  ${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}`
          ),
        ]
      );
      launcher.onclick = () => {
        panelOpen = true;
        renderPanel();
      };
      wrap.appendChild(launcher);
      return;
    }
    const done = Object.keys(state.achievements).length;
    const pct = Math.round((done / ACHIEVEMENTS.length) * 100);
    const panel = el("div", { class: "ach-panel" }, [
      el("div", { class: "ach-panel__head" }, [
        el("div", { class: "ach-panel__title" }, "// ACHIEVEMENTS"),
        el(
          "button",
          {
            class: "ach-panel__close",
            "aria-label": "Close",
            onclick: () => {
              panelOpen = false;
              renderPanel();
            },
          },
          "×"
        ),
      ]),
      el("div", { class: "ach-panel__progress" }, [
        el("div", { class: "flex between" }, [
          el("span", {}, `${done} / ${ACHIEVEMENTS.length} unlocked`),
          el("span", { class: "muted" }, `${pct}%`),
        ]),
        el(
          "div",
          { class: "ach-panel__bar" },
          el("div", { class: "ach-panel__bar-fill", style: `width:${pct}%` })
        ),
      ]),
      el(
        "ul",
        { class: "ach-list" },
        ACHIEVEMENTS.map((a) => {
          const done = !!state.achievements[a.id];
          return el(
            "li",
            { class: "ach-item" + (done ? " ach-item--done" : "") },
            [
              el("div", { class: "ach-item__box" }, done ? "✓" : ""),
              el("div", { style: "flex:1" }, [
                el("div", { class: "ach-item__title" }, a.title),
                el(
                  "div",
                  { class: "ach-item__desc" },
                  done ? a.desc : "— locked —"
                ),
              ]),
            ]
          );
        })
      ),
    ]);
    wrap.appendChild(panel);
  }

  // -------- COMMAND PALETTE --------
  let cmdkOpen = false;
  let cmdkQuery = "";
  let cmdkActive = 0;
  function commands() {
    const pageCmds = CATALOG.pages.map((p) => ({
      group: "JUMP TO",
      glyph: "→",
      title: p.title,
      hint: p.path,
      onSelect: () => {
        if (location.pathname.endsWith(p.path)) {
          closeCmdk();
        } else {
          location.href = p.path;
        }
      },
    }));
    const sectionCmds = [];
    const pageId = document.body.dataset.page;
    if (pageId && CATALOG.sections[pageId]) {
      CATALOG.sections[pageId].forEach((s) => {
        if ($("#" + s)) {
          sectionCmds.push({
            group: "SECTIONS ON THIS PAGE",
            glyph: "§",
            title: s.toUpperCase(),
            hint: "scroll",
            onSelect: () => {
              const node = $("#" + s);
              if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
              closeCmdk();
            },
          });
        }
      });
    }
    const action = [
      {
        group: "ACTIONS",
        glyph: "⌥",
        title: state.deepMode ? "Switch to SKIM mode" : "Switch to DEEP mode",
        hint: state.deepMode ? "compress" : "expand",
        onSelect: () => {
          toggleDeep();
          closeCmdk();
        },
      },
      {
        group: "ACTIONS",
        glyph: "⌥",
        title: "Reset progress (clear localStorage)",
        hint: "danger",
        onSelect: () => {
          if (confirm("Reset all portfolio progress?")) {
            localStorage.removeItem(KEY);
            location.reload();
          }
        },
      },
      {
        group: "ACTIONS",
        glyph: "✉",
        title: "Email Alejandro",
        hint: "mailto",
        onSelect: () => (location.href = "mailto:alejandro.melian.r@gmail.com"),
      },
    ];
    return [...pageCmds, ...sectionCmds, ...action];
  }
  function filteredCommands() {
    const q = cmdkQuery.trim().toLowerCase();
    const all = commands();
    if (!q) return all;
    return all.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        (c.hint && c.hint.toLowerCase().includes(q))
    );
  }
  function openCmdk() {
    cmdkOpen = true;
    cmdkQuery = "";
    cmdkActive = 0;
    renderCmdk();
    unlock("command-line");
    setTimeout(() => $(".cmdk__input")?.focus(), 30);
  }
  function closeCmdk() {
    cmdkOpen = false;
    renderCmdk();
  }
  function renderCmdk() {
    const root = $("#cmdk-root");
    if (!root) return;
    root.innerHTML = "";
    if (!cmdkOpen) return;
    const cmds = filteredCommands();
    if (cmdkActive >= cmds.length) cmdkActive = 0;
    let currentGroup = null;
    const items = [];
    cmds.forEach((c, i) => {
      if (c.group !== currentGroup) {
        currentGroup = c.group;
        items.push(el("div", { class: "cmdk__group" }, c.group));
      }
      const node = el(
        "div",
        {
          class: "cmdk__item" + (i === cmdkActive ? " cmdk__item--active" : ""),
          onclick: () => c.onSelect(),
          onmouseenter: () => {
            cmdkActive = i;
            renderCmdk();
          },
        },
        [
          el("span", { class: "cmdk__item-glyph" }, c.glyph),
          el("span", {}, c.title),
          el("span", { class: "cmdk__hint" }, c.hint || ""),
        ]
      );
      items.push(node);
    });
    const scrim = el(
      "div",
      { class: "cmdk-scrim", onclick: (e) => e.target === scrim && closeCmdk() },
      [
        el("div", { class: "cmdk", role: "dialog", "aria-label": "Command palette" }, [
          el("div", { class: "cmdk__head" }, [
            el("span", { class: "cmdk__prompt" }, "›"),
            el("input", {
              class: "cmdk__input",
              placeholder: "type to filter — projects, sections, actions",
              value: cmdkQuery,
              oninput: (e) => {
                cmdkQuery = e.target.value;
                cmdkActive = 0;
                renderCmdk();
                setTimeout(() => $(".cmdk__input")?.focus(), 0);
              },
              onkeydown: (e) => {
                if (e.key === "Escape") closeCmdk();
                else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  cmdkActive = Math.min(cmdkActive + 1, cmds.length - 1);
                  renderCmdk();
                  setTimeout(() => $(".cmdk__input")?.focus(), 0);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  cmdkActive = Math.max(cmdkActive - 1, 0);
                  renderCmdk();
                  setTimeout(() => $(".cmdk__input")?.focus(), 0);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  cmds[cmdkActive]?.onSelect();
                }
              },
            }),
            el("span", { class: "cmdk__esc" }, "ESC"),
          ]),
          el(
            "div",
            { class: "cmdk__list" },
            cmds.length === 0
              ? el("div", { class: "cmdk__empty" }, "// no matches")
              : items
          ),
          el("div", { class: "cmdk__foot" }, [
            el("span", {}, "↑↓ navigate"),
            el("span", {}, "↵ select"),
            el("span", {}, "ESC close"),
          ]),
        ]),
      ]
    );
    root.appendChild(scrim);
  }

  // -------- SKIM / DEEP MODE --------
  function applyDeepMode() {
    document.body.classList.toggle("skim", !state.deepMode);
    $$(".js-mode-label").forEach(
      (n) => (n.textContent = state.deepMode ? "DEEP" : "SKIM")
    );
    $$(".js-mode-toggle").forEach((n) => {
      n.setAttribute("aria-pressed", String(!state.deepMode));
    });
  }
  function toggleDeep() {
    state.deepMode = !state.deepMode;
    saveState();
    applyDeepMode();
    unlock("skim-or-deep");
  }

  // -------- EASTER EGGS --------
  // Konami
  const KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiBuf = [];
  function handleKonami(e) {
    konamiBuf.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    if (konamiBuf.length > KONAMI.length) konamiBuf.shift();
    if (
      konamiBuf.length === KONAMI.length &&
      konamiBuf.every((k, i) => k === KONAMI[i])
    ) {
      unlock("konami");
      flashKonami();
      konamiBuf = [];
    }
  }
  function flashKonami() {
    const banner = el(
      "div",
      { class: "konami-banner" },
      "[ CHEAT CODE ACCEPTED ] — CRT mode enabled · refresh to revert"
    );
    document.body.appendChild(banner);
    document.documentElement.style.filter = "contrast(1.05) saturate(1.15)";
    document.documentElement.style.transition = "filter 320ms";
    setTimeout(() => {
      banner.style.transition = "opacity 320ms";
      banner.style.opacity = "0";
      setTimeout(() => banner.remove(), 360);
    }, 3000);
  }

  // -------- BIND --------
  function bindLogo() {
    const logos = $$("[data-shell-logo]");
    logos.forEach((l) =>
      l.addEventListener("click", () => {
        state.logoClicks += 1;
        saveState();
        if (state.logoClicks >= 5) unlock("logo-tap");
      })
    );
  }
  function bindModeToggles() {
    $$(".js-mode-toggle").forEach((n) => {
      n.addEventListener("click", toggleDeep);
    });
  }
  function bindFootnotes() {
    $$("[data-footnote]").forEach((n) => {
      n.addEventListener("click", () => unlock("footnote"));
    });
  }
  function bindSectionObservers() {
    const pageId = document.body.dataset.page;
    if (!pageId) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target.dataset.section) {
            markSection(pageId, e.target.dataset.section);
          }
        });
      },
      { threshold: 0.35 }
    );
    $$("[data-section]").forEach((n) => obs.observe(n));
  }

  // resume reading
  function bindScrollSave() {
    const pageId = document.body.dataset.page;
    if (!pageId) return;
    let last = 0;
    window.addEventListener("scroll", () => {
      renderProgress();
      const now = Date.now();
      if (now - last > 350) {
        last = now;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
        state.scroll[pageId] = { y: window.scrollY, pct };
        saveState();
        if (pct > 92) unlock("deep-reader");
      }
    }, { passive: true });
  }
  function offerResume() {
    const pageId = document.body.dataset.page;
    if (!pageId) return;
    const slot = $("#resume-slot");
    if (!slot) return;
    const s = state.scroll[pageId];
    if (!s || s.pct < 12 || s.pct > 88) return;
    const banner = el(
      "div",
      { class: "card card--shadow", style: "padding:10px 14px;display:flex;gap:12px;align-items:center;font-size:12px;" },
      [
        el("span", { class: "tag tag--accent" }, "RESUME"),
        el("span", {}, `You stopped at ${Math.round(s.pct)}% — pick up where you left off.`),
        el("span", { class: "spacer" }),
        el(
          "button",
          {
            class: "btn",
            onclick: () => {
              window.scrollTo({ top: s.y, behavior: "smooth" });
              banner.remove();
            },
          },
          "JUMP →"
        ),
        el(
          "button",
          {
            class: "btn",
            onclick: () => banner.remove(),
            style: "border-color:var(--hair-strong);color:var(--ink-3);",
          },
          "DISMISS"
        ),
      ]
    );
    slot.appendChild(banner);
  }

  // Cmd+K hotkey
  function bindHotkeys() {
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cmdkOpen ? closeCmdk() : openCmdk();
        return;
      }
      if (e.key === "Escape" && cmdkOpen) closeCmdk();
      handleKonami(e);
    });
  }

  // public surface
  window.Portfolio = {
    state,
    unlock,
    openCmdk,
    closeCmdk,
    toggleDeep,
    catalog: CATALOG,
    achievements: ACHIEVEMENTS,
    percentExplored,
    on,
    emit,
  };

  // -------- INIT --------
  function init() {
    // build shell roots if missing
    if (!$(".shell-progress")) {
      const p = el("div", { class: "shell-progress" }, [
        el("div", { class: "shell-progress__bar" }),
      ]);
      document.body.appendChild(p);
    }
    if (!$("#cmdk-root")) {
      document.body.appendChild(el("div", { id: "cmdk-root" }));
    }
    if (!$("#ach-panel-root")) {
      document.body.appendChild(el("div", { id: "ach-panel-root" }));
    }

    // mark this page visited
    const pageId = document.body.dataset.page;
    if (pageId) markVisit(pageId);

    // bind
    bindHotkeys();
    bindLogo();
    bindModeToggles();
    bindFootnotes();
    bindSectionObservers();
    bindScrollSave();
    applyDeepMode();
    renderProgress();
    renderPanel();

    // initial reveal after frame
    requestAnimationFrame(() => {
      renderProgress();
      offerResume();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
