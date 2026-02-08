   

// iOS flag for performance tweaks
(function () {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) document.documentElement.classList.add("is-ios");
})();
     /* =========================
   VMC HOME (Slider Services C)
========================= */

// year
const y = document.getElementById("y");
if (y) y.textContent = String(new Date().getFullYear());

// reveal on scroll (lighter: unobserve after first reveal)
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target); // ✅ stop observing after first reveal
        }
      }
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));


// ===== Trusted marquee fixes (no shake + seamless + run only when visible) =====
(function () {
  const marquees = Array.from(document.querySelectorAll(".marquee"));
  if (!marquees.length) return;

  // Make the loop seamless by duplicating track children once (no HTML changes)
  marquees.forEach((mq) => {
    const track = mq.querySelector(".track");
    if (!track || track.dataset.duplicated === "1") return;

    const kids = Array.from(track.children);
    kids.forEach((node) => track.appendChild(node.cloneNode(true)));
    track.dataset.duplicated = "1";
  });

  // Run animation only when marquee is near viewport (reduces work + prevents jitter on scroll)
  if ("IntersectionObserver" in window) {
    const mo = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add("is-running");
          else en.target.classList.remove("is-running");
        });
      },
      { threshold: 0.05, rootMargin: "120px 0px" }
    );
    marquees.forEach((mq) => mo.observe(mq));
  } else {
    marquees.forEach((mq) => mq.classList.add("is-running"));
  }
})();
} else {
  // fallback: reveal everything if IO not supported
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

// magnetic (optimized with requestAnimationFrame)
document.querySelectorAll(".magnetic").forEach((el) => {
  const strength = 10;
  let raf = 0;
  let lastX = 0;
  let lastY = 0;

  el.addEventListener("pointermove", (ev) => {
    const r = el.getBoundingClientRect();
    lastX = ev.clientX - (r.left + r.width / 2);
    lastY = ev.clientY - (r.top + r.height / 2);

    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      el.style.transform = `translate(${lastX / strength}px, ${lastY / strength}px)`;
    });
  });

  el.addEventListener("pointerleave", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    el.style.transform = `translate(0px, 0px)`;
  });
});

/* =========================
   Services Slider C controller
========================= */
const viewport = document.getElementById("servicesViewport");
const bar = document.getElementById("servicesBar");
const slides = viewport ? Array.from(viewport.querySelectorAll(".slide")) : [];
const dotsWrap = document.getElementById("servicesDots");
let dots = Array.from(document.querySelectorAll(".dot2"));

function buildServicesDots() {
  if (!viewport) return;
  if (!dotsWrap || !slides.length) return;
  dotsWrap.innerHTML = slides
    .map((_, i) => `<span class="dot2 ${i === 0 ? "is-active" : ""}" data-i="${i}"></span>`)
    .join("");
  dots = Array.from(dotsWrap.querySelectorAll(".dot2"));
  dotsWrap.addEventListener("click", (e) => {
    const dot = e.target.closest(".dot2");
    if (!dot) return;
    const i = Number(dot.dataset.i);
    scrollToIndex(clamp(i, 0, Math.max(0, slides.length - 1)));
  });
}

const prevBtn = document.getElementById("prevSlide");
const nextBtn = document.getElementById("nextSlide");

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function getSlideWidth() {
  if (!viewport) return 0;
  return viewport.clientWidth; // each slide = 100% width
}

function getIndexFromScroll() {
  if (!viewport) return 0;
  const w = getSlideWidth();
  if (!w) return 0;
  return clamp(Math.round(viewport.scrollLeft / w), 0, Math.max(0, slides.length - 1));
}

function scrollToIndex(idx) {
  if (!viewport) return;
  const w = getSlideWidth();
  viewport.scrollTo({ left: idx * w, behavior: "smooth" });
}

function updateServicesUI() {
  if (!viewport) return;
  const idx = getIndexFromScroll();

  // dots
  dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));

  // progress bar
  if (bar) {
    const total = Math.max(1, slides.length || 1);
    const pct = ((idx + 1) / total) * 100;
    bar.style.width = `${pct}%`;
  }
}

if (viewport) {
  // build dots (dynamic)
  buildServicesDots();

  // initial
  updateServicesUI();

  // scroll updates
  let raf = 0;
  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateServicesUI);
    },
    { passive: true }
  );

  // wheel -> horizontal (throttled for smoothness)
  let wheelRAF = 0;
  let wheelAcc = 0;
  let wheelT = 0;

  viewport.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      e.preventDefault();
      wheelAcc += e.deltaY;

      if (!wheelRAF) {
        viewport.classList.add("is-dragging");

        wheelRAF = requestAnimationFrame(() => {
          viewport.scrollLeft += wheelAcc;
          wheelAcc = 0;
          wheelRAF = 0;

          clearTimeout(wheelT);
          wheelT = setTimeout(() => viewport.classList.remove("is-dragging"), 120);
        });
      }
    },
    { passive: false }
  );

  // keyboard
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const idx = getIndexFromScroll();
      scrollToIndex(clamp(idx + dir, 0, Math.max(0, slides.length - 1)));
    }
  });

  // drag to scroll (fixed: no click stealing + threshold)
  let isDown = false;
  let moved = false;
  let startX = 0;
  let startLeft = 0;

  viewport.addEventListener("pointerdown", (e) => {
    // Left click / primary touch only
    if (e.button !== 0) return;

    // Don't start dragging when interacting with controls inside a slide
    if (e.target.closest("a, button, [role='button'], input, textarea, select, label")) return;

    isDown = true;
    moved = false;
    startX = e.clientX;
    startLeft = viewport.scrollLeft;
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;

    const dx = e.clientX - startX;

    // Small threshold so taps/clicks don't become drags
    if (!moved && Math.abs(dx) < 6) return;

    if (!moved) {
      moved = true;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture?.(e.pointerId);
    }

    viewport.scrollLeft = startLeft - dx;
  });

  function endDrag() {
    if (!isDown) return;
    isDown = false;

    if (moved) {
      viewport.classList.remove("is-dragging");

      // snap to nearest slide
      const idx = getIndexFromScroll();
      scrollToIndex(idx);
    }

    moved = false;
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);
}

// arrows
prevBtn?.addEventListener("click", () => {
  const idx = getIndexFromScroll();
  scrollToIndex(clamp(idx - 1, 0, Math.max(0, slides.length - 1)));
});
nextBtn?.addEventListener("click", () => {
  const idx = getIndexFromScroll();
  scrollToIndex(clamp(idx + 1, 0, Math.max(0, slides.length - 1)));
});

// on resize keep correct snap
window.addEventListener("resize", () => {
  if (!viewport) return;
  const idx = getIndexFromScroll();
  viewport.scrollLeft = idx * getSlideWidth();
  updateServicesUI();
});



