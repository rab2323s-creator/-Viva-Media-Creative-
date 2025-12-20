const yearEl = document.getElementById("y");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("is-in");
  }
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Button glow follow mouse
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("pointermove", (ev) => {
    const r = btn.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 100;
    const y = ((ev.clientY - r.top) / r.height) * 100;
    btn.style.setProperty("--mx", `${x}%`);
    btn.style.setProperty("--my", `${y}%`);
  });
});

// Simple magnetic effect (luxury touch)
document.querySelectorAll(".magnetic").forEach(el => {
  const strength = 10;
  el.addEventListener("pointermove", (ev) => {
    const r = el.getBoundingClientRect();
    const dx = ev.clientX - (r.left + r.width / 2);
    const dy = ev.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx / strength}px, ${dy / strength}px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = `translate(0px, 0px)`;
  });
});

// 3D tilt cards (premium hover)
document.querySelectorAll("[data-tilt]").forEach(card => {
  const max = 10;
  card.addEventListener("pointermove", (ev) => {
    const r = card.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width;
    const py = (ev.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -2 * max;
    const ry = (px - 0.5) *  2 * max;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  });
});
