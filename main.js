// Plano Digital: consentimiento de cookies, movimiento, menú y formulario a WhatsApp.
// Todo el contenido es visible sin JS; el movimiento solo se suma y respeta "reducir movimiento".
(function () {
  var WA = '525550534007';
  var root = document.querySelector('.pd');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Cookies y consentimiento ================= */
  // Ningún script de análisis o marketing se carga hasta que la persona lo acepta.
  // Esos scripts viven en el HTML como <script type="text/plain" data-consent="analisis|marketing">
  // y solo se activan aquí, después del consentimiento.
  var CK = 'pd_consent';
  var MAX_AGE = 60 * 60 * 24 * 365; // 12 meses
  var memory = null; // respaldo si el navegador bloquea cookies

  function readConsent() {
    var m = document.cookie.match(/(?:^|; )pd_consent=([^;]*)/);
    var raw = m ? decodeURIComponent(m[1]) : null;
    if (!raw) { try { raw = localStorage.getItem(CK); } catch (e) { raw = null; } }
    if (!raw && memory) return memory;
    try {
      var v = JSON.parse(raw);
      if (v && v.v === 1 && new Date(v.expira) > new Date()) return v;
    } catch (e) {}
    return null;
  }
  function writeConsent(analisis, marketing) {
    var now = new Date();
    var exp = new Date(now.getTime() + MAX_AGE * 1000);
    var v = { v: 1, analisis: !!analisis, marketing: !!marketing, fecha: now.toISOString().slice(0, 10), expira: exp.toISOString() };
    var val = encodeURIComponent(JSON.stringify(v));
    document.cookie = CK + '=' + val + '; Max-Age=' + MAX_AGE + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    if (document.cookie.indexOf(CK + '=') === -1) { try { localStorage.setItem(CK, JSON.stringify(v)); } catch (e) {} }
    memory = v;
    return v;
  }
  function activate(cat) {
    document.querySelectorAll('script[type="text/plain"][data-consent="' + cat + '"]').forEach(function (old) {
      var s = document.createElement('script');
      if (old.dataset.src) { s.src = old.dataset.src; s.defer = true; } else { s.text = old.textContent; }
      old.replaceWith(s);
    });
  }
  function apply(v) {
    if (v.analisis) activate('analisis');
    if (v.marketing) activate('marketing');
  }

  var banner = document.getElementById('ck-banner');
  var panel = document.getElementById('ck-panel');
  var live = document.getElementById('ck-live');
  var swA = document.getElementById('ck-analisis');
  var swM = document.getElementById('ck-marketing');
  var opener = null;
  var ro = null;

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    document.documentElement.classList.add('has-ck');
    var setH = function () { document.documentElement.style.setProperty('--ck-h', banner.offsetHeight + 'px'); };
    setH();
    if ('ResizeObserver' in window) { ro = new ResizeObserver(setH); ro.observe(banner); }
  }
  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    document.documentElement.classList.remove('has-ck');
    document.documentElement.style.removeProperty('--ck-h');
    if (ro) { ro.disconnect(); ro = null; }
  }
  function openPanel(from) {
    if (!panel) return;
    opener = from || document.activeElement;
    var v = readConsent();
    swA.checked = !!(v && v.analisis);
    swM.checked = !!(v && v.marketing);
    if (typeof panel.showModal === 'function') panel.showModal(); else panel.setAttribute('open', '');
    swA.focus();
  }
  function closePanel() {
    if (!panel) return;
    if (typeof panel.close === 'function' && panel.open) panel.close(); else panel.removeAttribute('open');
  }
  function save(analisis, marketing) {
    var prev = readConsent();
    var v = writeConsent(analisis, marketing);
    hideBanner();
    closePanel();
    if (live) live.textContent = 'Guardamos tu elección de cookies.';
    // Si retiras un permiso que ya estaba activo, recargamos para descargar esos scripts.
    if (prev && ((prev.analisis && !v.analisis) || (prev.marketing && !v.marketing))) { location.reload(); return; }
    apply(v);
  }

  if (panel) {
    panel.addEventListener('close', function () { if (opener && opener.focus) opener.focus(); });
    panel.addEventListener('click', function (e) { if (e.target === panel) closePanel(); });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ck], [data-ck-save], [data-ck-close], [data-cookie-prefs]');
    if (!t) return;
    if (t.hasAttribute('data-cookie-prefs')) { openPanel(t); return; }
    if (t.hasAttribute('data-ck-close')) { closePanel(); return; }
    var a = t.getAttribute('data-ck');
    if (a === 'all') save(true, true);
    else if (a === 'none') save(false, false);
    else if (a === 'config') openPanel(t);
    var b = t.getAttribute('data-ck-save');
    if (b === 'all') save(true, true);
    else if (b === 'none') save(false, false);
    else if (b === 'choice') save(swA.checked, swM.checked);
  });

  var current = readConsent();
  if (current) apply(current); else showBanner();

  /* ================= Movimiento ================= */
  // Profundidad con el mouse en el hero: solo con mouse o trackpad.
  function startParallax() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var hero = root.querySelector('.hero');
    var scene = root.querySelector('.mock');
    var stage = scene && scene.querySelector('.stage');
    if (!hero || !stage) return;
    var layers = Array.prototype.slice.call(scene.querySelectorAll('[data-depth]'));
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function tick() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      stage.style.transform = 'rotateX(' + (-cy * 5).toFixed(3) + 'deg) rotateY(' + (cx * 7).toFixed(3) + 'deg)';
      layers.forEach(function (l) {
        var d = +l.getAttribute('data-depth');
        l.style.transform = 'translate3d(' + (cx * d).toFixed(2) + 'px,' + (cy * d * 0.6).toFixed(2) + 'px,0)';
      });
      scene.style.setProperty('--gx', (50 + cx * 38).toFixed(1) + '%');
      scene.style.setProperty('--gy', (45 + cy * 38).toFixed(1) + '%');
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(tick) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function clamp(v) { return Math.max(-1, Math.min(1, v)); }
    hero.addEventListener('pointermove', function (e) {
      var r = scene.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2);
      kick();
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  }

  if (root && 'IntersectionObserver' in window) {
    // Menú: marca la sección en la que estás (solo en la página principal)
    var links = {};
    root.querySelectorAll('.nav li a:not(.btn)').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h.charAt(0) === '#') links[h.slice(1)] = a;
    });
    var navIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('on', k === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    root.querySelectorAll('main section[id]').forEach(function (s) { navIO.observe(s); });

    if (!reduce) {
      startParallax();
      var items = root.querySelectorAll('.rv, .watch');
      var fired = false;
      var io = new IntersectionObserver(function (es) {
        fired = true;
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      items.forEach(function (el) { io.observe(el); });
      root.classList.add('mo');
      // Seguro: si el observador nunca responde, se muestra todo
      setTimeout(function () { if (!fired) items.forEach(function (el) { el.classList.add('is-in'); }); }, 2000);
    }
  }

  /* ================= Menú móvil ================= */
  var btn = document.getElementById('menu-btn');
  var nav = document.getElementById('menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('open', open);
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
  }

  /* ================= Formulario a WhatsApp ================= */
  var form = document.getElementById('contact-form');
  if (!form) return;

  function setError(input, msg) {
    var id = input.id + '-err';
    var el = document.getElementById(id);
    var anchor = input.type === 'checkbox' ? input.parentNode.lastElementChild : input;
    if (!msg) {
      input.removeAttribute('aria-invalid');
      if (el) el.remove();
      input.setAttribute('aria-describedby', (input.getAttribute('aria-describedby') || '').replace(id, '').trim());
      return;
    }
    input.setAttribute('aria-invalid', 'true');
    if (!el) {
      el = document.createElement('span');
      el.id = id;
      el.className = 'err';
      anchor.insertAdjacentElement('afterend', el);
      input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '') + ' ' + id).trim());
    }
    el.textContent = msg;
  }

  function check() {
    var f = form.elements;
    var first = null;
    if (!f.nombre.value.trim()) { setError(f.nombre, 'Escribe tu nombre.'); first = first || f.nombre; }
    else setError(f.nombre, '');
    if (f.whatsapp.value.replace(/\D/g, '').length < 10) { setError(f.whatsapp, 'Escribe tu número a 10 dígitos.'); first = first || f.whatsapp; }
    else setError(f.whatsapp, '');
    if (!f.acepto.checked) { setError(f.acepto, 'Para enviar, marca que leíste y aceptas el Aviso de Privacidad.'); first = first || f.acepto; }
    else setError(f.acepto, '');
    if (first) first.focus();
    return !first;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!check()) return;
    var f = form.elements;
    var txt = 'Hola, soy ' + f.nombre.value.trim() +
      '. Me interesa: ' + f.paquete.value +
      '. Mi WhatsApp: ' + f.whatsapp.value.trim() + '.' +
      (f.mensaje.value.trim() ? ' ' + f.mensaje.value.trim() : '') +
      ' (Acepto el Aviso de Privacidad. Novedades y promociones: ' + (f.promos.checked ? 'sí' : 'no') + ')';
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    window.open(url, '_blank', 'noopener');
    // Enlace de respaldo por si el navegador bloquea la ventana nueva
    var link = document.getElementById('wa-go');
    if (!link) {
      link = document.createElement('a');
      link.id = 'wa-go';
      link.className = 'btn btn-olive btn-full';
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Abrir WhatsApp con tu mensaje';
      form.appendChild(link);
    }
    link.href = url;
  });
})();
