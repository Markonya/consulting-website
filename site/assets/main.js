/* =============================================================
   Марьян Кротов — интерактив
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'mk-theme';

  /* Страницы существуют в двух языках: RU — /, EN — /en/.
     Язык определяется по атрибуту lang, строки берутся из справочника. */
  var isEN = (root.getAttribute('lang') || '').toLowerCase().indexOf('en') === 0;

  var I18N = {
    ru: {
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      formGreeting: 'Здравствуйте, Марьян! Хочу обсудить проект.',
      formName: 'Имя: ',
      formCompany: 'Компания: ',
      formMessage: 'О проекте: ',
      formContact: 'Связь со мной: ',
      formFooter: '— Отправлено с сайта'
    },
    en: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      formGreeting: 'Hello, Marian! I would like to discuss a project.',
      formName: 'Name: ',
      formCompany: 'Company: ',
      formMessage: 'About the project: ',
      formContact: 'Best way to reach me: ',
      formFooter: '— Sent from the website'
    }
  };

  var t = I18N[isEN ? 'en' : 'ru'];

  /* ---------------------- Переключение темы ---------------------- */
  var toggle = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f1113' : '#f7f5f0');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // Следуем за системной темой, пока пользователь не выбрал вручную
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchemeChange = function (e) {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) {}
    if (!stored) applyTheme(e.matches ? 'dark' : 'light');
  };
  if (prefersDark.addEventListener) prefersDark.addEventListener('change', onSchemeChange);
  else if (prefersDark.addListener) prefersDark.addListener(onSchemeChange);

  /* --------------------------- Шапка --------------------------- */
  var header = document.getElementById('siteHeader');
  var lastScroll = -1;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y === lastScroll) return;
    lastScroll = y;
    if (header) header.classList.toggle('is-scrolled', y > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------ Мобильное меню ---------------------- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function setNav(open) {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.toggle('is-open', open);
    mobileNav.hidden = !open;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? t.closeMenu : t.openMenu);
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      setNav(mobileNav.hidden);
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080 && !mobileNav.hidden) setNav(false);
    });
  }

  /* ------------------- Переключение языка ------------------------ */
  // При переходе на другой язык сохраняем текущий раздел страницы:
  // id секций в обеих версиях совпадают, поэтому якорь переносится как есть.
  var langLinks = document.querySelectorAll('[data-lang-link]');
  if (langLinks.length && window.location.hash) {
    Array.prototype.forEach.call(langLinks, function (a) {
      var href = a.getAttribute('href');
      if (href && href.indexOf('#') === -1) a.setAttribute('href', href + window.location.hash);
    });
  }

  // Подсветка активного раздела
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting; });
      if (!visible.length) return;
      var activeId = visible[0].target.id;
      navLinks.forEach(function (a) {
        a.style.color = a.getAttribute('href') === '#' + activeId ? 'var(--accent)' : '';
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------- Появление ------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { revealObs.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-in'); });
  }

  /* --------------------- Анимация диаграмм ---------------------- */
  var fills = document.querySelectorAll('.bar-fill');
  if (fills.length && 'IntersectionObserver' in window) {
    // Запоминаем целевую ширину до обнуления, иначе анимация стартует с нуля
    Array.prototype.forEach.call(fills, function (el) {
      el.setAttribute('data-width', el.style.width || '0%');
      el.style.width = '0%';
    });
    var fillObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = el.getAttribute('data-width') || '0%';
        requestAnimationFrame(function () { el.style.width = target; });
        obs.unobserve(el);
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(fills, function (el) { fillObs.observe(el); });
  }

  /* ------------------- Форма заявки → Telegram ------------------- */
  var form = document.getElementById('leadForm');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var company = (data.get('company') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();
      var contact = (data.get('contact') || '').toString().trim();

      var lines = [
        t.formGreeting
      ];
      if (name) lines.push(t.formName + name);
      if (company) lines.push(t.formCompany + company);
      if (message) lines.push(t.formMessage + message);
      if (contact) lines.push(t.formContact + contact);
      lines.push(t.formFooter);

      var url = 'https://t.me/Mark0nya?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }

  /* --------------------------- Год ----------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

