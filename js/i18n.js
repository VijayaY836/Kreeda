/* KREEDA — one language setting for the whole app.
   Every page (and every game inside a card) reads the same choice, so picking
   తెలుగు on the home page switches everything.

   Plain-HTML pages load this file, register their own words with
   KREEDA_I18N.add({ en:{…}, hi:{…}, … }), and mark text with:
     data-i18n="key"                 → element text
     data-i18n-attr="attr:key;…"     → attributes (aria-label, title, placeholder…)
   A button with data-lang-picker becomes the language menu.

   The choice is saved under localStorage "kreeda-lang". Pages opened inside a
   card also get ?lang=xx in their address, in case storage isn't shared. */
(function () {
  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം' },
  ];
  const CODES = LANGS.map(l => l.code);
  const KEY = 'kreeda-lang';

  const fromUrl = new URLSearchParams(location.search).get('lang');
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  let lang = CODES.includes(fromUrl) ? fromUrl : CODES.includes(stored) ? stored : 'en';

  // words shared by every page
  const dict = {
    en: { 'common.language': 'Language', 'common.home': 'Home', 'common.account': 'Account', 'common.close': 'Close' },
    hi: { 'common.language': 'भाषा', 'common.home': 'होम', 'common.account': 'खाता', 'common.close': 'बंद करें' },
    te: { 'common.language': 'భాష', 'common.home': 'హోమ్', 'common.account': 'ఖాతా', 'common.close': 'మూసివేయి' },
    ta: { 'common.language': 'மொழி', 'common.home': 'முகப்பு', 'common.account': 'கணக்கு', 'common.close': 'மூடு' },
    ml: { 'common.language': 'ഭാഷ', 'common.home': 'ഹോം', 'common.account': 'അക്കൗണ്ട്', 'common.close': 'അടയ്ക്കുക' },
  };
  const listeners = [];

  function add(words) {
    for (const code of Object.keys(words)) dict[code] = Object.assign(dict[code] || {}, words[code]);
  }

  // t('key', { n: 3 }) → the word in the current language, falling back to English, then the key
  function t(key, vars) {
    let s = (dict[lang] && dict[lang][key]) ?? (dict.en && dict.en[key]) ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(x => x.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
    document.querySelectorAll('[data-lang-picker] .lang-current').forEach(el => {
      el.textContent = LANGS.find(l => l.code === lang).label;
    });
  }

  function set(code, persist) {
    if (!CODES.includes(code) || code === lang) return;
    lang = code;
    if (persist !== false) { try { localStorage.setItem(KEY, code); } catch (e) { /* storage blocked */ } }
    apply();
    listeners.forEach(fn => fn(lang));
  }

  // another tab or page changed it
  window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) set(e.newValue, false); });

  /* ---------- the language menu ---------- */
  const style = document.createElement('style');
  style.textContent = `
    .lang-menu{position:fixed; z-index:200; min-width:170px; padding:6px; margin:0; list-style:none;
      background:#FBF3E2; border:1px solid #C7A467; border-radius:14px;
      box-shadow:0 14px 34px rgba(42,30,20,.22); font-family:inherit;}
    .lang-menu[hidden]{display:none;}
    .lang-menu button{appearance:none; display:flex; align-items:center; justify-content:space-between; gap:12px;
      width:100%; padding:9px 12px; border:0; border-radius:9px; background:none; color:#2A241E;
      font:inherit; font-size:14px; text-align:left; cursor:pointer;}
    .lang-menu button:hover, .lang-menu button:focus-visible{background:rgba(199,164,103,.2); outline:none;}
    .lang-menu button[aria-checked="true"]{font-weight:700;}
    .lang-menu button[aria-checked="true"]::after{content:'✓'; color:#1F3B2E;}
  `;
  document.head.appendChild(style);

  let menu = null, owner = null;
  function closeMenu(refocus) {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    if (owner) { owner.setAttribute('aria-expanded', 'false'); if (refocus) owner.focus(); }
  }
  function openMenu(btn) {
    if (!menu) {
      menu = document.createElement('ul');
      menu.className = 'lang-menu';
      menu.setAttribute('role', 'menu');
      LANGS.forEach(l => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'menuitemradio');
        b.setAttribute('lang', l.code);
        b.dataset.code = l.code;
        b.textContent = l.label;
        b.addEventListener('click', () => { set(l.code); closeMenu(true); });
        li.appendChild(b);
        menu.appendChild(li);
      });
      document.body.appendChild(menu);
    }
    owner = btn;
    menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.code === lang)));
    const r = btn.getBoundingClientRect();
    menu.hidden = false;
    const w = menu.offsetWidth;
    menu.style.top = Math.round(r.bottom + 6) + 'px';
    menu.style.left = Math.round(Math.max(8, Math.min(r.right - w, innerWidth - w - 8))) + 'px';
    btn.setAttribute('aria-expanded', 'true');
    (menu.querySelector('[aria-checked="true"]') || menu.querySelector('button')).focus();
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-lang-picker]');
    if (btn) { e.stopPropagation(); (menu && !menu.hidden && owner === btn) ? closeMenu() : openMenu(btn); return; }
    if (menu && !menu.hidden && !menu.contains(e.target)) closeMenu();
  }, true);
  document.addEventListener('keydown', e => {
    if (!menu || menu.hidden) return;
    const items = [...menu.querySelectorAll('button')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  }, true);
  window.addEventListener('resize', () => closeMenu());
  window.addEventListener('scroll', () => closeMenu(), true);

  function mountPickers() {
    document.querySelectorAll('[data-lang-picker]').forEach(btn => {
      btn.setAttribute('aria-haspopup', 'menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', t('common.language'));
      btn.setAttribute('data-i18n-attr', 'aria-label:common.language');
    });
  }

  window.KREEDA_I18N = {
    LANGS,
    get lang() { return lang; },
    add, t, apply, set,
    onChange(fn) { listeners.push(fn); },
  };

  function init() { mountPickers(); apply(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
