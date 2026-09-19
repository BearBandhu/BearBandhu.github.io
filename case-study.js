/* ============================================================
   CASE STUDY — shared helpers
   - TL;DR sticky strip
   - skim/deep aware
   - expand blocks
   - reading time, scroll resume (via shell)
   - footnote toggle
   - recommend next project
   ============================================================ */

(function () {
  "use strict";

  // expand blocks
  document.querySelectorAll("[data-expand]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".expand");
      const body = wrap.querySelector(".expand__body");
      const caret = btn.querySelector(".expand__caret");
      const open = body.dataset.reveal === "true";
      body.dataset.reveal = open ? "false" : "true";
      caret.textContent = open ? "+" : "−";
    });
  });

  // approximate reading time
  function estimateReadingTime() {
    const root = document.querySelector("[data-reading-target]") || document.body;
    const text = root.innerText || "";
    const words = text.trim().split(/\s+/).length;
    return Math.max(2, Math.round(words / 230)); // ~230 wpm
  }
  document.querySelectorAll("[data-reading-time]").forEach((n) => {
    n.textContent = estimateReadingTime() + " min read";
  });

  // recommend next
  const pageId = document.body.dataset.page;
  const order = ["innova", "lyly", "edenic"];
  const next = order[(order.indexOf(pageId) + 1) % order.length];
  document.querySelectorAll("[data-next-link]").forEach((a) => {
    const map = {
      innova: { href: "case-innova.html", t: "Innova Schools", k: "EdTech mobile retention" },
      lyly: { href: "case-lyly.html", t: "Lyly Interactive", k: "B2C ecosystem · 3 apps" },
      edenic: { href: "case-edenic.html", t: "Edenic Era", k: "game systems for retention" },
    };
    const m = map[next];
    a.href = m.href;
    a.querySelector("[data-next-title]")?.replaceChildren(m.t);
    a.querySelector("[data-next-kicker]")?.replaceChildren(m.k);
  });

  // jump menu for section nav (sticky-toc)
  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length) {
    const sections = Array.from(tocLinks).map((a) => document.querySelector(a.getAttribute("href")));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = "#" + e.target.id;
            tocLinks.forEach((a) =>
              a.classList.toggle("toc-active", a.getAttribute("href") === id)
            );
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => s && obs.observe(s));
  }
})();
