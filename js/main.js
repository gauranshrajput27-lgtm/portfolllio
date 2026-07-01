(function () {
  /* Mobile nav */
  var toggle = document.querySelector('.nav__toggle');
  var navLinks = document.getElementById('nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* Animated counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var duration = 1200;
        var start = performance.now();

        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) {
      counterObserver.observe(c);
    });
  }

  /* Back to top */
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------
     3D Scroll Card Animation — v4
     Sticky scroll section inside a tall trigger.
     progress 0→1 = scrolling through the trigger.

     Phase 1 (0 → 0.5):  rotateX 45°→0°, scale 0.85 → fillScale
                          (card scales until corners meet viewport edges)
                          Header fades out + slides up (0→0.25)
     Phase 2 (0.5 → 1.0): Scale stays at fillScale (full screen),
                           borders/radius/shadow melt, card content fades,
                           sections below transition to dark mode matching card style.
     ------------------------------------------------ */
  var trigger     = document.getElementById('scroll-anim-trigger');
  var cardWrap    = document.getElementById('scroll-card-wrap');
  var cardEl      = document.querySelector('#scroll-showcase .scroll-card');
  var cardInner   = document.querySelector('#scroll-showcase .scroll-card__inner');
  var cardHeader  = document.querySelector('#scroll-showcase .scroll-anim__header');
  var cardContent = document.querySelector('#scroll-showcase .scroll-card__content');
  var cardBar     = document.querySelector('#scroll-showcase .scroll-card__bar');

  /* Sections below the scroll animation that will transition to dark mode */
  var marqueeStrip = document.querySelector('.marquee-strip');
  var aboutSection = document.getElementById('about');

  if (trigger && cardWrap && cardEl) {

    /* ---- helpers ---- */
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* ---- calculate the scale so card corners meet viewport edges ---- */
    var fillScale = 1;
    function calcFillScale() {
      var nW = cardWrap.offsetWidth  || 1;
      var nH = cardWrap.offsetHeight || 1;
      var scaleW = window.innerWidth  / nW;
      var scaleH = window.innerHeight / nH;
      fillScale  = Math.max(scaleW, scaleH) * 1.02;
    }

    /* ---- Apply dark-mode CSS variable overrides to a section ----
       t=0 → original light theme,  t=1 → card's dark theme.
       Because the whole design system uses CSS vars (--bg, --fg, etc.),
       overriding them on the element cascades to ALL children automatically. */
    function applyDarkTransition(el, t) {
      if (!el) return;

      if (t <= 0.001) {
        /* Remove inline overrides → restore original CSS */
        el.style.removeProperty('--bg');
        el.style.removeProperty('--fg');
        el.style.removeProperty('--fg-muted');
        el.style.removeProperty('--surface');
        el.style.removeProperty('--border');
        el.style.removeProperty('--border-strong');
        el.style.removeProperty('background-color');
        el.style.removeProperty('color');
        return;
      }

      /* --bg:  #E8E4DC (232,228,220) → #111116 (17,17,22) */
      var bgR = Math.round(lerp(232, 17, t));
      var bgG = Math.round(lerp(228, 17, t));
      var bgB = Math.round(lerp(220, 22, t));

      /* --fg:  #0A0A0F (10,10,15)    → #E8E4DC (232,228,220) */
      var fgR = Math.round(lerp(10, 232, t));
      var fgG = Math.round(lerp(10, 228, t));
      var fgB = Math.round(lerp(15, 220, t));

      el.style.setProperty('--bg',            'rgb(' + bgR + ',' + bgG + ',' + bgB + ')');
      el.style.setProperty('--fg',            'rgb(' + fgR + ',' + fgG + ',' + fgB + ')');
      el.style.setProperty('--fg-muted',      'rgba(' + fgR + ',' + fgG + ',' + fgB + ',0.65)');
      el.style.setProperty('--surface',       'rgba(' + fgR + ',' + fgG + ',' + fgB + ',0.04)');
      el.style.setProperty('--border',        'rgba(' + fgR + ',' + fgG + ',' + fgB + ',0.12)');
      el.style.setProperty('--border-strong', 'rgba(' + fgR + ',' + fgG + ',' + fgB + ',0.25)');

      el.style.backgroundColor = 'rgb(' + bgR + ',' + bgG + ',' + bgB + ')';
      el.style.color           = 'rgb(' + fgR + ',' + fgG + ',' + fgB + ')';
    }

    /* ---- main update loop ---- */
    function updateCard() {
      var trigRect = trigger.getBoundingClientRect();
      var viewH    = window.innerHeight;

      /* scrolledPast: px scrolled into the trigger past its entry */
      var scrolledPast = -trigRect.top;
      var scrollable   = trigger.offsetHeight - viewH;
      var progress     = clamp(scrolledPast / scrollable, 0, 1);

      /* ====== PHASE 1 (progress 0 → 0.5): Tilt + Scale to fill viewport ====== */
      var phase1 = clamp(progress / 0.5, 0, 1);

      /* Tilt: 45° → 0° */
      var rotate = lerp(45, 0, easeOut(phase1));

      /* Scale: 0.85 → fillScale  (card grows until corners meet viewport) */
      var scale  = lerp(0.85, fillScale, easeInOut(phase1));

      cardWrap.style.transform =
        'rotateX(' + rotate.toFixed(2) + 'deg) scale(' + scale.toFixed(4) + ')';

      /* Header: fade out + slide up (progress 0 → 0.25) */
      if (cardHeader) {
        var hP  = clamp(progress / 0.25, 0, 1);
        var hE  = easeOut(hP);
        cardHeader.style.opacity   = (1 - hE).toFixed(3);
        cardHeader.style.transform = 'translateY(' + lerp(0, -50, hE).toFixed(1) + 'px)';
        if (hP >= 1) cardHeader.style.pointerEvents = 'none';
      }

      /* ====== PHASE 2 (progress 0.5 → 1.0): Opening / Dark Transition ====== */
      var phase2 = clamp((progress - 0.5) / 0.5, 0, 1);
      var p2e    = easeOut(phase2);

      /* Border radius + padding melt: 24px → 0 */
      var radius  = lerp(24, 0, p2e);
      var pad     = lerp(8, 0, p2e);
      var borderA = lerp(1, 0, p2e);
      var innerR  = lerp(16, 0, p2e);

      cardEl.style.borderRadius = radius.toFixed(1) + 'px';
      cardEl.style.padding      = pad.toFixed(1) + 'px';
      cardEl.style.borderColor  = 'rgba(108,108,108,' + borderA.toFixed(3) + ')';
      if (cardInner) {
        cardInner.style.borderRadius = innerR.toFixed(1) + 'px';
      }

      /* Fade out card content (services, CTA, bar) */
      if (cardContent) {
        cardContent.style.opacity   = (1 - p2e).toFixed(3);
        cardContent.style.transform = 'translateY(' + lerp(0, -40, p2e).toFixed(1) + 'px)';
      }
      if (cardBar) {
        cardBar.style.opacity = (1 - p2e).toFixed(3);
      }

      /* Grid overlay fades */
      if (cardInner) {
        cardInner.style.setProperty('--grid-opacity', (1 - p2e).toFixed(3));
      }

      /* Shadow melts away */
      var shadowA = 1 - p2e;
      cardEl.style.boxShadow =
        '0 0 rgba(0,0,0,' + (0.3 * shadowA).toFixed(3) + '), ' +
        '0 9px 20px rgba(0,0,0,' + (0.29 * shadowA).toFixed(3) + '), ' +
        '0 37px 37px rgba(0,0,0,' + (0.26 * shadowA).toFixed(3) + '), ' +
        '0 84px 50px rgba(0,0,0,' + (0.15 * shadowA).toFixed(3) + ')';

      /* ====== DARK MODE on sections below ======
         As the card fills the screen & its content fades, the sections below
         transition to match the card's dark aesthetic — creating a seamless
         "portal" effect where the dark card becomes the page. */
      applyDarkTransition(marqueeStrip, p2e);
      applyDarkTransition(aboutSection, p2e);
    }

    window.addEventListener('scroll', updateCard, { passive: true });
    window.addEventListener('resize', function () {
      calcFillScale();
      updateCard();
    }, { passive: true });

    calcFillScale();
    updateCard();
  }
})();

/* 3D Tilt Card — mouse-tracking for [data-tilt] elements */
(function () {
  var cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;

  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var ry = ((x - cx) / cx) * 8;
      var rx = -((y - cy) / cy) * 8;
      var mx = ((x / rect.width) * 100).toFixed(1);
      var my = ((y / rect.height) * 100).toFixed(1);

      card.style.setProperty('--rx', rx + 'deg');
      card.style.setProperty('--ry', ry + 'deg');
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* Tabs */
(function () {
  document.querySelectorAll('.tabs').forEach(function (tabs) {
    var triggers = tabs.querySelectorAll('.tabs__trigger');
    var panels = tabs.querySelectorAll('.tabs__panel');

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        triggers.forEach(function (t) { t.classList.remove('tabs__trigger--active'); });
        panels.forEach(function (p) { p.classList.remove('tabs__panel--active'); });

        trigger.classList.add('tabs__trigger--active');
        var target = tabs.querySelector('#' + trigger.getAttribute('data-tab'));
        if (target) target.classList.add('tabs__panel--active');
      });
    });
  });
})();

/* Modal */
(function () {
  var overlay = document.getElementById('modal-overlay');
  var trigger = document.getElementById('modal-trigger');
  var close1 = document.getElementById('modal-close');
  var close2 = document.getElementById('modal-close2');
  if (!overlay) return;

  function openModal() { overlay.classList.add('modal-overlay--open'); }
  function closeModal() { overlay.classList.remove('modal-overlay--open'); }

  if (trigger) trigger.addEventListener('click', openModal);
  if (close1) close1.addEventListener('click', closeModal);
  if (close2) close2.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
})();

/* Toast */
(function () {
  var container = document.getElementById('toast-container');
  var toast = document.getElementById('toast');
  var trigger = document.getElementById('toast-trigger');
  var close = document.getElementById('toast-close');
  if (!toast) return;

  function showToast() {
    toast.classList.add('toast--show');
    setTimeout(function () { toast.classList.remove('toast--show'); }, 3000);
  }

  if (trigger) trigger.addEventListener('click', showToast);
  if (close) close.addEventListener('click', function () { toast.classList.remove('toast--show'); });
})();

/* Preloader */
(function () {
  var preloader = document.getElementById('preloader');
  var barFill = preloader ? preloader.querySelector('.preloader__bar-fill') : null;
  if (!preloader) return;

  /* Skip if already visited this session */
  if (sessionStorage.getItem('preloader-done')) {
    preloader.remove();
    document.body.classList.remove('preloader-active');
    return;
  }

  /* Lock scroll */
  document.body.classList.add('preloader-active');

  var minTime = 2500;
  var startTime = Date.now();
  var progress = 0;
  var assetsLoaded = false;

  /* Animate progress bar */
  var barInterval = setInterval(function () {
    var elapsed = Date.now() - startTime;
    var timeProgress = Math.min(elapsed / minTime, 1);
    var target = assetsLoaded ? 100 : timeProgress * 85;
    progress = Math.min(target, progress + 1);
    if (barFill) barFill.style.width = progress + '%';
    if (progress >= 100) clearInterval(barInterval);
  }, 30);

  /* Wait for fonts */
  var fontPromise = document.fonts ? document.fonts.ready : Promise.resolve();

  /* Wait for images */
  var images = Array.from(document.querySelectorAll('img'));
  var imagePromises = images.map(function (img) {
    if (img.complete) return Promise.resolve();
    return new Promise(function (resolve) {
      img.addEventListener('load', resolve);
      img.addEventListener('error', resolve);
    });
  });

  /* Resolve when everything is ready */
  Promise.all([fontPromise, Promise.all(imagePromises)]).then(function () {
    assetsLoaded = true;
  });

  /* Hide preloader after minimum time + assets */
  function hidePreloader() {
    progress = 100;
    if (barFill) barFill.style.width = '100%';

    setTimeout(function () {
      preloader.classList.add('preloader--hidden');
      document.body.classList.remove('preloader-active');
      sessionStorage.setItem('preloader-done', '1');

      setTimeout(function () {
        preloader.remove();
      }, 700);
    }, 400);
  }

  /* Check every 100ms if ready */
  var checkInterval = setInterval(function () {
    var elapsed = Date.now() - startTime;
    if (assetsLoaded && elapsed >= minTime) {
      clearInterval(checkInterval);
      hidePreloader();
    }
  }, 100);

  /* Safety: always hide after 5s */
  setTimeout(function () {
    clearInterval(checkInterval);
    if (!preloader.classList.contains('preloader--hidden')) {
      hidePreloader();
    }
  }, 5000);
})();

