/** Shared lightweight enhancements for Viva /مشاهير/ادارة-المشاهير/ articles. No dependencies. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const toggle = $('#ce-mobile-toggle');
  const menu = $('#ce-mobile-nav');
  if (toggle && menu) {
    const setOpen = open => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      menu.hidden = !open;
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
  }

  const progress = $('#ce-reading-progress');
  let frameRequested = false;
  function updateProgress() {
    frameRequested = false;
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 100;
    progress.style.width = percentage.toFixed(2) + '%';
  }
  function requestProgress() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(updateProgress);
  }
  window.addEventListener('scroll', requestProgress, {passive: true});
  window.addEventListener('resize', requestProgress);
  requestProgress();

  const article = $('#ce-article');
  const toc = $('#ce-toc-list');
  if (article && toc) {
    // For future articles, keep TOC updated automatically from H2 headings with ids.
    const headers = $$('h2[id]', article).filter(h => !h.hasAttribute('data-toc-skip'));
    toc.replaceChildren();
    headers.forEach(header => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + encodeURIComponent(header.id);
      a.textContent = header.textContent.trim();
      li.append(a);
      toc.append(li);
    });
    if ('IntersectionObserver' in window) {
      const links = $$('a', toc);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(link => link.removeAttribute('aria-current'));
            const active = links.find(link => decodeURIComponent(link.hash.slice(1)) === entry.target.id);
            if (active) active.setAttribute('aria-current', 'location');
          }
        });
      }, {rootMargin: '-120px 0px -65% 0px', threshold: 0});
      headers.forEach(h => observer.observe(h));
    }
    const readTime = $('#ce-reading-time');
    if (readTime) {
      const words = article.textContent.trim().split(/\s+/).filter(Boolean).length;
      readTime.textContent = 'وقت القراءة التقريبي: ' + Math.max(1, Math.ceil(words / 190)) + ' دقيقة';
    }
  }

  const copyButton = $('#ce-copy-link');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw Error('Clipboard not supported');
        await navigator.clipboard.writeText(window.location.href);
        copyButton.textContent = 'تم نسخ الرابط';
      } catch (_) {
        // Show the address to allow manual copying when browser clipboard is unavailable.
        window.prompt('انسخ رابط المقال:', window.location.href);
      }
    });
  }
  const year = $('#ce-year');
  if (year) year.textContent = new Date().getFullYear();
})();
