/* ==========================================================
   Forno Vivo — script.js
   - Scroll animation Canvas (food-rustic, 151 frame .webp, cover §4.2)
   - IntersectionObserver: .fade-up, .stagger-card
   - Parallax (desktop only, max 100px)
   - Image fallback (window.__imgFallback)
   - Anno corrente footer
   Vanilla JS, no dipendenze esterne.
   ========================================================== */

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Anno corrente nel footer
  // ----------------------------------------------------------
  var yearEl = document.getElementById('year');
  if (yearEl && (!yearEl.textContent || /^\{\{/.test(yearEl.textContent))) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----------------------------------------------------------
  // Scroll Animation — food-rustic (§4.2 cover mode)
  // ----------------------------------------------------------
  var canvas = document.getElementById('scroll-canvas');
  var section = document.getElementById('scroll-anim');

  if (canvas && section) {
    var ctx = canvas.getContext('2d');
    var pin = section.querySelector('.scroll-anim-pin');

    var FRAME_PATH = 'https://8ispuxmgjxgu2r5q.public.blob.vercel-storage.com/templates/ristoranti-004/frames/';
    var FRAME_COUNT = 151;
    var FRAME_PREFIX = 'frame_';
    var FRAME_PAD = 4;
    var FRAME_EXT = '.webp';

    var images = [];
    var loaded = 0;

    function setupCanvas() {
      var dpr = window.devicePixelRatio || 1;
      var cw = pin.clientWidth;
      var ch = pin.clientHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render(progress) {
      var idx = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(progress * FRAME_COUNT))
      );
      var img = images[idx];
      if (!img || !img.complete) return;

      var cw = pin.clientWidth;
      var ch = pin.clientHeight;
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;

      var scale = Math.max(cw / iw, ch / ih);
      var dw = iw * scale;
      var dh = ih * scale;
      var dx = (cw - dw) / 2;
      var dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function onScroll() {
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) { render(0); return; }
      var progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      render(progress);
    }

    for (var i = 1; i <= FRAME_COUNT; i++) {
      var img = new Image();
      var num = String(i);
      while (num.length < FRAME_PAD) num = '0' + num;
      img.src = FRAME_PATH + FRAME_PREFIX + num + FRAME_EXT;
      img.onload = (function () {
        loaded++;
        if (loaded === 1) {
          setupCanvas();
          onScroll();
        }
      });
      images.push(img);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      setupCanvas();
      onScroll();
    });
  }

  // ----------------------------------------------------------
  // Parallax — desktop only, max 100px offset
  // ----------------------------------------------------------
  var isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (!isMobile) {
    var parallaxImages = document.querySelectorAll('.parallax-img');

    function updateParallax() {
      parallaxImages.forEach(function (img) {
        var wrap = img.closest('.parallax-wrap') || img.parentElement;
        var rect = wrap.getBoundingClientRect();
        var viewH = window.innerHeight;
        if (rect.bottom < 0 || rect.top > viewH) return;
        var progress = (viewH - rect.top) / (viewH + rect.height);
        var offset = (progress - 0.5) * 100;
        img.style.transform = 'translateY(' + offset + 'px)';
      });
    }

    if (parallaxImages.length) {
      window.addEventListener('scroll', updateParallax, { passive: true });
      updateParallax();
    }
  }

  // ----------------------------------------------------------
  // IntersectionObserver — Fade Up
  // ----------------------------------------------------------
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      fadeObserver.observe(el);
    });

    // Stagger Cards
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.dataset.stagger || 0, 10) * 130;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stagger-card').forEach(function (el) {
      staggerObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up, .stagger-card').forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();

// ----------------------------------------------------------
// Image Fallback — SVG placeholder on onerror
// ----------------------------------------------------------
window.__imgFallback = function (img, label) {
  var wrapper = document.createElement('div');
  wrapper.className = 'img-svg-fallback';
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', label);
  var gid = 'g' + Date.now() + Math.random().toString(36).substr(2, 4);
  wrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="currentColor" stop-opacity="0.12"/>' +
    '<stop offset="100%" stop-color="currentColor" stop-opacity="0.04"/>' +
    '</linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#' + gid + ')"/>' +
    '<text x="400" y="320" text-anchor="middle" font-family="serif" font-size="28" font-style="italic" fill="currentColor" opacity="0.5">' + label + '</text>' +
    '</svg>';
  img.replaceWith(wrapper);
};
