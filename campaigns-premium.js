(function(){
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(el => observer.observe(el));

  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      btn.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
})();
