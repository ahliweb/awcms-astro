/*
 * Reading preferences, early-apply half (ADR-0055): sets the data-a11y-*
 * attributes on <html> before first paint. A classic blocking file, like
 * tema.js, because inline scripts are blocked by the CSP and an Astro bundle
 * runs too late. Keep it unhashed in public/, not in /_astro/.
 *
 * Hand-written copy of src/lib/aksesibilitas.ts (storage contract, attributes);
 * tests/aksesibilitas.test.mjs runs both against the same fixtures. Never
 * throws: blocked storage, bad JSON and a missing matchMedia all mean "use the
 * OS defaults". data-a11y-ready marks that this ran.
 */
(function () {
  var root = document.documentElement;
  var KEY = 'awcms-a11y';
  var SWITCHES = ['contrast', 'mono', 'dyslexia', 'underline', 'highlight', 'motion'];

  function parse(raw) {
    var o;
    try {
      o = JSON.parse(raw);
    } catch (e) {
      return null;
    }
    if (typeof o !== 'object' || o === null || Array.isArray(o)) return null;
    if (o.v !== 1) return null;
    if (o.text !== 'normal' && o.text !== 'large' && o.text !== 'x-large') return null;
    for (var i = 0; i < SWITCHES.length; i++) {
      if (typeof o[SWITCHES[i]] !== 'boolean') return null;
    }
    return o;
  }

  function os(query) {
    try {
      return window.matchMedia(query).matches;
    } catch (e) {
      return false;
    }
  }

  var prefs = null;
  try {
    prefs = parse(localStorage.getItem(KEY));
  } catch (e) {
    /* storage blocked: fall through to the OS defaults */
  }

  if (!prefs) {
    prefs = {
      text: 'normal',
      contrast: os('(prefers-contrast: more)'),
      mono: false,
      dyslexia: false,
      underline: false,
      highlight: false,
      motion: os('(prefers-reduced-motion: reduce)')
    };
  }

  function set(name, value) {
    if (value === null) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }

  set('data-a11y-text', prefs.text === 'normal' ? null : prefs.text);
  set('data-a11y-contrast', prefs.contrast ? '' : null);
  set('data-a11y-mono', prefs.mono ? '' : null);
  set('data-a11y-dyslexia', prefs.dyslexia ? '' : null);
  set('data-a11y-underline', prefs.underline ? '' : null);
  set('data-a11y-highlight', prefs.highlight ? '' : null);
  set('data-a11y-motion', prefs.motion ? 'reduce' : null);

  root.setAttribute('data-a11y-ready', '');
})();
