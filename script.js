// Holy Quran School & Madrasah — site behaviour
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mobile = () => window.matchMedia('(max-width:1024px)').matches;

  // Header shadow on scroll
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const nav = $('#nav');
  const menuBtn = $('#menuBtn');
  function setMenu(open) {
    if (open) nav.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));

  // Dropdowns: on mobile the first tap on a parent link expands its submenu
  $$('.has-drop', nav).forEach(link => {
    const drop = link.nextElementSibling;
    link.setAttribute('aria-haspopup', 'true');
    link.addEventListener('click', e => {
      if (!mobile()) return;
      if (!drop.classList.contains('open')) {
        e.preventDefault();
        $$('.drop.open', nav).forEach(d => d.classList.remove('open'));
        drop.classList.add('open');
      }
    });
  });
  nav.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a && !a.classList.contains('has-drop') && mobile()) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
  });

  // Scroll reveal
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // "On this page" navigation: highlight the section in view
  const toc = $('.toc');
  if (toc) {
    const links = $$('a', toc);
    const sections = links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
    const setActive = () => {
      let current = sections[0];
      sections.forEach(s => { if (s.getBoundingClientRect().top < 160) current = s; });
      links.forEach(a => a.classList.toggle('active', a.hash === '#' + current.id));
    };
    setActive();
    window.addEventListener('scroll', setActive, { passive: true });
  }

  // Gallery lightbox
  const gallery = $('[data-gallery]');
  const lb = $('#lightbox');
  if (gallery && lb) {
    const items = $$('button', gallery);
    const img = $('img', lb);
    const count = $('.lb-count', lb);
    let i = 0, opener = null;
    const show = n => {
      i = (n + items.length) % items.length;
      const src = $('img', items[i]);
      img.src = src.src; img.alt = src.alt;
      count.textContent = `${i + 1} / ${items.length}`;
    };
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; opener && opener.focus(); };
    items.forEach((b, n) => b.addEventListener('click', () => {
      opener = b; show(n); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus();
    }));
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => show(i - 1));
    $('.lb-next', lb).addEventListener('click', () => show(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  // Forms: validate required fields, then open an email draft to the office
  $$('form[data-mailto]').forEach(form => {
    const error = $('.form-error', form);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const required = $$('[required]', form);
      const missing = required.filter(f => !f.value.trim());
      required.forEach(f => f.setAttribute('aria-invalid', missing.includes(f)));
      if (missing.length) {
        const names = missing.map(f => $(`label[for="${f.id}"]`, form).textContent.trim().toLowerCase());
        error.textContent = `Add ${names.join(', ').replace(/, ([^,]*)$/, ' and $1')} to send this.`;
        error.hidden = false;
        missing[0].focus();
        return;
      }
      error.hidden = true;
      const body = [...new FormData(form)].map(([k, v]) => `${k}: ${v || '-'}`).join('\n');
      location.href = `mailto:hqsmedu@gmail.com?subject=${encodeURIComponent(form.dataset.mailto)}&body=${encodeURIComponent(body)}`;
    });
    $$('[required]', form).forEach(f => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));
  });

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
