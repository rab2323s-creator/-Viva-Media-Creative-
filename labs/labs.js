(() => {
  const year = document.getElementById('labsYear');
  if (year) year.textContent = new Date().getFullYear();

  const nav = document.getElementById('labsNav');
  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle('isScrolled', window.scrollY > 30);
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive:true });

  const revealItems = document.querySelectorAll('.labsReveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('isVisible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin:'0px 0px -8% 0px', threshold:.08 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('isVisible'));
  }

  requestAnimationFrame(() => {
    document.querySelectorAll('.labsHero .labsReveal').forEach((item, index) => {
      setTimeout(() => item.classList.add('isVisible'), index * 90);
    });
  });

  if (window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.labsProduct').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    });
  }
})();
