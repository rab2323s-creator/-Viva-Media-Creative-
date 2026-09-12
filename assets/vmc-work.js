(function () {
  const year = document.getElementById('y');
  if (year) year.textContent = new Date().getFullYear();

  // Header
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

  // Reveal
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

  // Filters
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-category]'));
  const empty = document.querySelector('[data-empty]');

  function setCounts() {
    document.querySelectorAll('[data-count]').forEach((node) => {
      const key = node.dataset.count;
      node.textContent = key === 'all' ? cards.length : cards.filter((card) => card.dataset.category === key).length;
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

  // Case-study preview dialog. Later replace these buttons with real /work/project-slug/ links.
  const dialog = document.querySelector('[data-case-dialog]');
  const dialogTitle = dialog?.querySelector('[data-dialog-title]');
  const dialogSummary = dialog?.querySelector('[data-dialog-summary]');
  const dialogMeta = dialog?.querySelector('[data-dialog-meta]');

  const previews = {
    'creator-growth': {
      title: 'إدارة ونمو البراند الشخصي',
      meta: 'Creator Management · GCC',
      summary: 'قالب مقترح لحالة نمو شخصية عامة: الوضع قبل العمل، إعادة التموضع، نظام المحتوى، إدارة الشراكات، ثم النتائج الموثقة.'
    },
    'influencer-launch': {
      title: 'إطلاق منتج عبر المؤثرين',
      meta: 'Influencer Marketing · Saudi Arabia',
      summary: 'قالب لحملة إطلاق يربط اختيار المؤثرين والرسائل والتتبع بالزيارات، الطلبات والعائد على الإنفاق.'
    },
    'seo-growth': {
      title: 'SEO & Growth Case Study',
      meta: 'Search Growth · UAE',
      summary: 'قالب يوضح نقطة البداية، فجوات الظهور، خارطة المحتوى والتحسين التقني، ثم أثر ذلك على الزيارات والـLeads.'
    },
    'viral-growth': {
      title: 'نظام محتوى للنمو العضوي',
      meta: 'Viral Strategy · Egypt',
      summary: 'قالب يشرح كيف تحولت فرضيات الـHooks والـFormats إلى نظام متكرر، مع مقارنة قبل/بعد للمشاهدة والاحتفاظ والوصول.'
    },
    'copy-performance': {
      title: 'Copywriting & Script Performance',
      meta: 'Content Systems · GCC',
      summary: 'قالب لقياس أثر السكريبت من أول 3 ثوانٍ وحتى CTA، مع مؤشرات Retention وCTR والتحويل.'
    },
    'campaign-performance': {
      title: 'حملة مؤثرين متعددة المنصات',
      meta: 'Influencer Campaign · UAE',
      summary: 'قالب لحملة تضم عدة Creators ومنصات، مع توزيع الميزانية، روابط التتبع، التحسين أثناء التنفيذ والنتيجة التجارية.'
    }
  };

  document.querySelectorAll('[data-open-case]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog) return;
      const item = previews[button.dataset.openCase] || {};
      if (dialogTitle) dialogTitle.textContent = item.title || 'معاينة دراسة الحالة';
      if (dialogSummary) dialogSummary.textContent = item.summary || '';
      if (dialogMeta) dialogMeta.textContent = item.meta || 'نموذج تجريبي';
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });

  dialog?.querySelector('[data-close-case]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
})();
