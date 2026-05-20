(function(){
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  const backdrop = document.querySelector('[data-backdrop]');
  const drawer = document.querySelector('[data-drawer]');
  const body = document.body;

  function openMenu(){
    body.classList.add('drawer-open');
    openBtn && openBtn.setAttribute('aria-expanded','true');
    drawer && drawer.setAttribute('aria-hidden','false');
  }
  function closeMenu(){
    body.classList.remove('drawer-open');
    openBtn && openBtn.setAttribute('aria-expanded','false');
    drawer && drawer.setAttribute('aria-hidden','true');
  }

  openBtn && openBtn.addEventListener('click', openMenu);
  closeBtn && closeBtn.addEventListener('click', closeMenu);
  backdrop && backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });
})();
