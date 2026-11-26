(function () {
  'use strict';
  if (window.top !== window) return;
  if (window.__anupomBar) return;
  var HOME = 'http://127.0.0.1:%PORT%/';
  var isHome = location.hostname === '127.0.0.1' && location.port === '%PORT%';
  if (isHome) return; // the home page has its own look and animations
  window.__anupomBar = true;

  var de = null;
  function whenRoot(fn) {
    if (document.documentElement) { de = document.documentElement; fn(); return; }
    var mo = new MutationObserver(function () {
      if (document.documentElement) { mo.disconnect(); de = document.documentElement; fn(); }
    });
    mo.observe(document, { childList: true });
  }

  /* ---------- page-appear animation (curtain that lifts when the page is ready) ---------- */
  var curtain = null;
  whenRoot(function () {
    try {
      var cs = document.createElement('style');
      cs.id = 'anupom-curtain-style';
      cs.textContent =
        '#anupom-curtain{position:fixed;inset:0;z-index:2147483646;background:radial-gradient(ellipse at 50% 40%,#1b1d4d 0%,#06061a 60%,#010001 100%);' +
        'display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;opacity:1;transition:opacity .45s ease,transform .6s cubic-bezier(.7,0,.2,1);pointer-events:all}' +
        '#anupom-curtain.out{opacity:0;transform:translateY(-6%) scale(1.04);pointer-events:none}' +
        '#anupom-curtain .ring{width:54px;height:54px;border-radius:50%;border:3px solid rgba(99,102,241,.2);border-top-color:#a855f7;border-right-color:#38bdf8;animation:anupomSpin .8s linear infinite;box-shadow:0 0 28px rgba(124,58,237,.55)}' +
        '#anupom-curtain .tx{font:600 15px "Segoe UI",Arial,sans-serif;letter-spacing:.5px;color:#b9bdff;animation:anupomPulse 1.1s ease-in-out infinite}' +
        '@keyframes anupomSpin{to{transform:rotate(360deg)}}' +
        '@keyframes anupomPulse{0%,100%{opacity:.45}50%{opacity:1}}' +
        '@keyframes anupomReveal{from{opacity:0}to{opacity:1}}' +
        'html.anupom-reveal body{animation:anupomReveal .7s ease both}' +
        'html{margin-top:46px !important}';
      (document.head || de).appendChild(cs);
      curtain = document.createElement('div');
      curtain.id = 'anupom-curtain';
      curtain.innerHTML = '<div class="ring"></div><div class="tx">Anupom Search</div>';
      de.appendChild(curtain);
    } catch (e) { }
  });

  var lifted = false;
  function liftCurtain() {
    if (lifted) return;
    lifted = true;
    try { (de || document.documentElement).classList.add('anupom-reveal'); } catch (e) { }
    if (!curtain) return;
    curtain.classList.add('out');
    setTimeout(function () {
      try { curtain.remove(); } catch (e) { }
      try { document.documentElement.classList.remove('anupom-reveal'); } catch (e) { }
    }, 900);
  }
  // Lift as soon as the page has content; never leave the curtain stuck.
  function onReady() { setTimeout(liftCurtain, 220); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();
  window.addEventListener('load', liftCurtain);
  setTimeout(liftCurtain, 3500);

  /* ---------- links that want a new window stay in this window (so Back always works) ---------- */
  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.ctrlKey || ev.shiftKey || ev.metaKey) return;
    var a = ev.target && ev.target.closest ? ev.target.closest('a[target]') : null;
    if (a && /^_blank$/i.test(a.getAttribute('target') || '') && /^https?:/i.test(a.href)) {
      a.setAttribute('target', '_self');
    }
  }, true);

  /* ---------- navigation bar ---------- */
  function build() {
    if (document.getElementById('anupom-bar-host')) return;
    var host = document.createElement('div');
    host.id = 'anupom-bar-host';
    host.style.cssText = 'all:initial;position:fixed;top:0;left:0;right:0;height:46px;z-index:2147483647;display:block;';
    var root = host.attachShadow({ mode: 'open' });
    var svg = function (d) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
    root.innerHTML =
      '<style>' +
      ':host{all:initial}' +
      '.b{position:relative;display:flex;align-items:center;gap:4px;height:46px;padding:0 10px;background:linear-gradient(180deg,#12132e,#0a0b1f);border-bottom:1px solid #2b2e63;box-shadow:0 2px 14px rgba(0,0,0,.45);font-family:"Segoe UI",Arial,sans-serif;animation:drop .5s cubic-bezier(.2,.8,.2,1) both}' +
      '@keyframes drop{from{transform:translateY(-100%);opacity:0}to{transform:none;opacity:1}}' +
      'button{display:flex;align-items:center;justify-content:center;border:0;background:transparent;width:34px;height:34px;border-radius:50%;cursor:pointer;color:#c9ccff;transition:background .15s,transform .15s,color .15s,opacity .15s}' +
      'button:hover:not(:disabled){background:#23265a;color:#fff;transform:scale(1.08)}' +
      'button:active:not(:disabled){transform:scale(.94)}' +
      'button:disabled{opacity:.3;cursor:default}' +
      '.nav{background:#1a1c44}' +
      'input{flex:1;min-width:80px;height:34px;border:1px solid #2b2e63;border-radius:17px;background:#0e0f26;color:#e8eaff;padding:0 16px;font-size:14px;outline:0;margin:0 6px;transition:border-color .2s,box-shadow .2s}' +
      'input::placeholder{color:#7a7eb8}' +
      'input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.25),0 0 18px rgba(99,102,241,.3)}' +
      '.s{width:auto;border-radius:17px;padding:0 18px;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(90deg,#2563eb,#7c3aed)}' +
      '.s:hover:not(:disabled){background:linear-gradient(90deg,#3b82f6,#8b5cf6);box-shadow:0 0 14px rgba(124,58,237,.55)}' +
      '.bar{position:absolute;left:0;bottom:-1px;height:3px;width:0;background:linear-gradient(90deg,#38bdf8,#6366f1,#a855f7);opacity:0;transition:opacity .3s}' +
      '.bar.on{opacity:1;animation:load 1.6s ease-in-out infinite}' +
      '@keyframes load{0%{left:0;width:0}50%{left:10%;width:70%}100%{left:100%;width:0}}' +
      '</style><div class="b">' +
      '<button class="nav" id="bk" title="Back" aria-label="Back">' + svg('<path d="M19 12H5M12 19l-7-7 7-7"/>') + '</button>' +
      '<button class="nav" id="fw" title="Forward" aria-label="Forward">' + svg('<path d="M5 12h14M12 5l7 7-7 7"/>') + '</button>' +
      '<button id="rl" title="Reload" aria-label="Reload">' + svg('<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>') + '</button>' +
      '<button id="hm" title="Home" aria-label="Home">' + svg('<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>') + '</button>' +
      '<input id="u" spellcheck="false" autocomplete="off" placeholder="Search with Anupom Search or type a URL">' +
      '<button class="s" id="go">Search</button>' +
      '<button id="ab" title="About Anupom Chakraborty" aria-label="About">' + svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>') + '</button>' +
      '<button id="ex" title="Open in default browser" aria-label="Open in browser">' + svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>') + '</button>' +
      '<div class="bar" id="pg"></div></div>';

    (de || document.documentElement).appendChild(host);

    var $ = function (id) { return root.getElementById(id); };
    var u = $('u'), bk = $('bk'), fw = $('fw'), pg = $('pg');

    function toUrl(v) {
      v = v.trim();
      if (!v) return HOME;
      if (/^(https?|file):\/\//i.test(v)) return v;
      if (/^localhost(:\d+)?(\/.*)?$/i.test(v)) return 'http://' + v;
      if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(v)) return 'https://' + v;
      return 'https://www.google.com/search?q=' + encodeURIComponent(v);
    }
    function loading(on) { pg.classList.toggle('on', !!on); }
    function go() { loading(true); location.href = toUrl(u.value); }

    function syncButtons() {
      // history.length counts cross-site entries too (navigation.canGoBack does not)
      bk.disabled = history.length <= 1;
      fw.disabled = false;
    }
    var last = '';
    function syncUrl() {
      syncButtons();
      if (location.href !== last && root.activeElement !== u) { last = location.href; u.value = location.href; }
    }
    syncUrl();
    setInterval(syncUrl, 400);
    try { if (window.navigation) window.navigation.addEventListener('currententrychange', syncUrl); } catch (e) { }

    bk.onclick = function () { loading(true); history.back(); setTimeout(function () { loading(false); }, 1500); };
    fw.onclick = function () { loading(true); history.forward(); setTimeout(function () { loading(false); }, 1500); };
    $('rl').onclick = function () { loading(true); location.reload(); };
    $('hm').onclick = function () { loading(true); location.href = HOME; };
    $('ab').onclick = function () { loading(true); location.href = HOME + '#about'; };
    $('ex').onclick = function () { if (window.anupomOpenExternal) window.anupomOpenExternal(location.href); };
    $('go').onclick = go;
    u.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); e.stopPropagation(); });
    u.addEventListener('focus', function () { u.select(); });

    window.addEventListener('beforeunload', function () { loading(true); });
    window.addEventListener('pageshow', function () { loading(false); syncUrl(); });
    window.addEventListener('load', function () { loading(false); });
    // keyboard shortcuts: Alt+Left / Alt+Right / Ctrl+L / F5 work too
    window.addEventListener('keydown', function (e) {
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); bk.click(); }
      else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); fw.click(); }
      else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); u.focus(); }
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
