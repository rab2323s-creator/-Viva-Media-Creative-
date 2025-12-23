(function () {
  const search = document.getElementById("toolsSearch");
  const chips = Array.from(document.querySelectorAll(".chip"));
  const sortSelect = document.getElementById("sortSelect");
  const cards = Array.from(document.querySelectorAll(".tool-card"));
  const hint = document.getElementById("resultsHint");
  const countEl = document.getElementById("toolsCount");

  // Count available tools (exclude coming soon if you want)
  const availableCount = cards.filter(c => !c.classList.contains("is-soon")).length;
  if (countEl) countEl.textContent = String(availableCount);

  let activeFilter = "all";

  function norm(s) {
    return (s || "").toString().trim().toLowerCase();
  }

  function matchesFilter(card) {
    if (activeFilter === "all") return true;
    const cats = norm(card.dataset.category).split(/\s+/);
    return cats.includes(activeFilter);
  }

  function matchesSearch(card) {
    const q = norm(search?.value);
    if (!q) return true;
    const hay = norm(card.dataset.title) + " " + norm(card.dataset.tags);
    return hay.includes(q);
  }

  function apply() {
    // Filter + search
    let visible = 0;
    cards.forEach(card => {
      const ok = matchesFilter(card) && matchesSearch(card);
      card.style.display = ok ? "" : "none";
      if (ok) visible++;
    });

    // Sort (only reorder visible ones inside parent)
    const grid = document.querySelector(".tools-grid");
    if (grid) {
      const shown = cards.filter(c => c.style.display !== "none");
      const hidden = cards.filter(c => c.style.display === "none");

      const mode = sortSelect?.value || "recommended";

      shown.sort((a, b) => {
        if (mode === "newest") {
          return norm(b.dataset.date).localeCompare(norm(a.dataset.date));
        }
        if (mode === "az") {
          return norm(a.dataset.title).localeCompare(norm(b.dataset.title), "ar");
        }
        // recommended
        const ra = parseInt(a.dataset.rank || "999", 10);
        const rb = parseInt(b.dataset.rank || "999", 10);
        return ra - rb;
      });

      // Re-append in order: shown then hidden (hidden keeps at end)
      [...shown, ...hidden].forEach(el => grid.appendChild(el));
    }

    if (hint) {
      hint.textContent = `النتائج: ${visible} / ${cards.length}`;
    }
  }

  // Chips
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      chips.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeFilter = btn.dataset.filter || "all";
      apply();
    });
  });

  // Search
  if (search) {
    search.addEventListener("input", apply);
  }

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener("change", apply);
  }

  // Initial
  apply();
})();
