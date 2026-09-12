 (function () {
  const year = document.getElementById('y');
  if (year) year.textContent = new Date().getFullYear();

  const nav = document.querySelector('[data-work-nav]');
  const toggle = nav?.querySelector('.workNav__toggle');
  const navLinks = nav?.querySelectorAll('.workNav__links a');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', function () {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  navLinks?.forEach((link) => link.addEventListener('click', closeNav));

  function onScroll() {
    nav?.classList.toggle('is-scrolled', window.scrollY > 18);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealEls = document.querySelectorAll('.workReveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '40px 0px -30px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-category]'));
  const empty = document.querySelector('[data-empty]');

  function setCounts() {
    document.querySelectorAll('[data-count]').forEach((node) => {
      const key = node.dataset.count;
      node.textContent = key === 'all'
        ? cards.length
        : cards.filter((card) => card.dataset.category === key).length;
    });
  }

  function applyFilter(key) {
    let visible = 0;
    cards.forEach((card) => {
      const show = key === 'all' || card.dataset.category === key;
      card.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((b) => b.classList.toggle('is-active', b === button));
      applyFilter(button.dataset.filter || 'all');
    });
  });

  setCounts();
})();
