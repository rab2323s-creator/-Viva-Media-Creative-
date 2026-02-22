/* Minimal reveal + magnetic (safe for pages without home slider elements) */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.14 });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }

  // Magnetic buttons (same feel as home, but local)
  const mags = Array.from(document.querySelectorAll('.magnetic'));
  if (!reduceMotion) {
    mags.forEach(btn => {
      let raf = 0;
      const strength = 12;
      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x * strength}px, ${y * strength}px) translateZ(0)`;
        });
      };
      const onLeave = () => {
        cancelAnimationFrame(raf);
        btn.style.transform = 'translateZ(0)';
      };
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
    });
  }
})();
