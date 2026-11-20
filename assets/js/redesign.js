(function () {
  'use strict';

  var tracks = Array.prototype.slice.call(document.querySelectorAll('[data-marquee]'));
  var projects = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
  var revealItems = document.querySelectorAll('.reveal-up');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frameRequested = false;

  function makeTile(work, duplicate) {
    var link = document.createElement(duplicate ? 'span' : 'a');
    link.className = 'showreel-tile';
    if (duplicate) {
      link.setAttribute('aria-hidden', 'true');
    } else {
      link.href = 'design.html';
      link.setAttribute('aria-label', work.title + ' 项目');
    }
    var image = document.createElement('img');
    image.src = work.cover;
    image.alt = duplicate ? '' : work.title;
    image.loading = 'lazy';
    link.appendChild(image);
    return link;
  }

  function populateMarquee() {
    var works = window.WORKS_DATA || [];
    if (!works.length || !tracks.length) return;
    tracks.forEach(function (track, index) {
      // 两行都展示作品集的全部作品，第二行倒序以保持错落感
      var selection = index === 0 ? works.slice() : works.slice().reverse();
      for (var repeat = 0; repeat < 3; repeat++) {
        selection.forEach(function (work) {
          track.appendChild(makeTile(work, repeat > 0));
        });
      }
      track.__groupCount = selection.length;
    });
  }

  var marqueeState = [];
  var marqueePaused = false;

  function measureMarquee() {
    var gap = 12;
    if (tracks.length) {
      var style = window.getComputedStyle(tracks[0]);
      var readGap = parseFloat(style.columnGap || style.gap);
      if (!isNaN(readGap)) gap = readGap;
    }
    marqueeState.forEach(function (state) {
      var tiles = state.track.children;
      var count = state.groupCount || tiles.length;
      var width = 0;
      for (var i = 0; i < count && i < tiles.length; i++) {
        width += tiles[i].getBoundingClientRect().width;
      }
      state.groupWidth = width + gap * count;
      if (tiles.length) state.tileWidth = tiles[0].getBoundingClientRect().width + gap;
    });
  }

  function initMarqueeAutoScroll() {
    if (!tracks.length || reduceMotion) return;
    tracks.forEach(function (track, index) {
      marqueeState.push({ track: track, offset: 0, groupWidth: 0, tileWidth: 0, groupCount: track.__groupCount || 0, index: index });
    });
    measureMarquee();
    // 两行错开半张卡片，保持错落感
    if (marqueeState.length > 1 && !reduceMotion) {
      var stagger = (marqueeState[1].tileWidth || 0) * 0.5;
      marqueeState[1].offset = -stagger;
      marqueeState[1].track.style.transform = 'translate3d(' + (-stagger).toFixed(1) + 'px,0,0)';
    }

    var showreel = document.querySelector('.showreel');
    if (showreel) {
      showreel.addEventListener('mouseenter', function () { marqueePaused = true; });
      showreel.addEventListener('mouseleave', function () { marqueePaused = false; });
    }

    var last = performance.now();
    var speed = 0.05;
    function tick(now) {
      var dt = Math.min(now - last, 64);
      last = now;
      if (!marqueePaused) {
        marqueeState.forEach(function (state) {
          if (!state.groupWidth) return;
          state.offset -= speed * dt;
          if (state.offset <= -state.groupWidth) state.offset += state.groupWidth;
          state.track.style.transform = 'translate3d(' + state.offset.toFixed(1) + 'px,0,0)';
        });
      }
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  function updateScrollEffects() {
    projects.forEach(function (card, index) {
      var rect = card.getBoundingClientRect();
      var progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top - 130) / (window.innerHeight * 0.75)));
      var targetScale = 1 - (projects.length - 1 - index) * 0.025;
      var scale = 1 - (1 - targetScale) * progress;
      card.style.transform = 'scale(' + scale.toFixed(3) + ')';
    });
    frameRequested = false;
  }

  function requestScrollUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScrollEffects);
  }

  function initCadetHero() {
    var stage = document.querySelector('.cadet-stage');
    if (!stage) return;

    var head = stage.querySelector('.cadet-head');
    var helmetButton = stage.querySelector('.helmet-button');
    var menuButton = stage.querySelector('.cadet-menu-button');
    var menu = stage.querySelector('.cadet-menu');
    var cursorDot = stage.querySelector('.cursor-dot');
    var cursorRing = stage.querySelector('.cursor-ring');
    var finePointer = window.matchMedia('(pointer:fine)').matches;
    var clipUrl = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/e1b48476-24ab-456a-bb12-13e63bc60973.mp4';
    var duration = 0;
    var targetTime = 0;
    var shownTime = 0;
    var lastPointerMove = performance.now();
    var pointerX = window.innerWidth / 2;
    var pointerY = window.innerHeight / 2;
    var ringX = pointerX;
    var ringY = pointerY;

    function setClipSource(source) {
      head.src = source;
      head.load();
      head.addEventListener('loadedmetadata', function () {
        duration = Math.max(0, head.duration - 0.02);
        targetTime = duration / 2;
        shownTime = targetTime;
        if (!head.seeking && duration) head.currentTime = shownTime;
      }, { once: true });
      head.addEventListener('loadeddata', function () {
        head.classList.add('is-ready');
      }, { once: true });
    }

    if (!reduceMotion && head) {
      fetch(clipUrl).then(function (response) {
        if (!response.ok) throw new Error('Head clip request failed');
        return response.blob();
      }).then(function (blob) {
        setClipSource(URL.createObjectURL(blob));
      }).catch(function () {
        setClipSource(clipUrl);
      });
    }

    function onPointerMove(event) {
      var bounds = stage.getBoundingClientRect();
      var relativeX = (event.clientX - bounds.left) / bounds.width;
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerMove = performance.now();
      if (duration) {
        var progress = Math.max(0, Math.min(1, (relativeX - 0.14) / 0.72));
        targetTime = progress * duration;
      }
      if (finePointer) stage.classList.add('cursor-active');
    }

    function animate(timestamp) {
      if (duration) {
        if (timestamp - lastPointerMove > 3500) {
          targetTime = duration * (0.5 + Math.sin(timestamp * 0.0004) * 0.16);
        }
        shownTime += (targetTime - shownTime) * 0.14;
        if (!head.seeking && Math.abs(head.currentTime - shownTime) > 0.015) {
          head.currentTime = Math.max(0, Math.min(duration, shownTime));
        }
      }
      if (finePointer && cursorDot && cursorRing && stage.classList.contains('cursor-active')) {
        cursorDot.style.transform = 'translate3d(' + pointerX + 'px,' + pointerY + 'px,0)';
        ringX += (pointerX - ringX) * 0.55;
        ringY += (pointerY - ringY) * 0.55;
        cursorRing.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
      }
      window.requestAnimationFrame(animate);
    }

    if (!reduceMotion) {
      stage.addEventListener('pointermove', onPointerMove);
      stage.addEventListener('pointerleave', function () {
        stage.classList.remove('cursor-active');
        lastPointerMove = performance.now() - 3501;
      });
      window.requestAnimationFrame(animate);
    }

    if (helmetButton) {
      helmetButton.addEventListener('click', function () {
        var isOn = stage.classList.toggle('helmet-on');
        helmetButton.setAttribute('aria-pressed', String(isOn));
        helmetButton.setAttribute('aria-label', isOn ? '摘下头盔' : '戴上头盔');
        helmetButton.classList.add('is-pressed');
        window.setTimeout(function () { helmetButton.classList.remove('is-pressed'); }, 320);
      });
    }

    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        var isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
        menu.classList.toggle('is-open', isOpen);
      });
      menu.addEventListener('click', function (event) {
        if (!event.target.closest('a')) return;
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', '打开导航菜单');
        menu.classList.remove('is-open');
      });
    }

    if (!reduceMotion) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { stage.classList.add('is-entered'); });
      });
    }
  }

  function initReveal() {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealItems.forEach(function (item) { observer.observe(item); });
  }

  function initAnchorNav() {
    var menu = document.querySelector('.navbar-menu');
    if (!menu) return;
    menu.addEventListener('click', function (event) {
      if (!event.target.closest('a')) return;
      menu.classList.remove('active');
      var toggle = document.querySelector('.navbar-toggle');
      if (!toggle) return;
      toggle.setAttribute('aria-label', '打开菜单');
      var icon = toggle.querySelector('.navbar-toggle-icon');
      if (icon) icon.textContent = '☰';
    });
  }

  populateMarquee();
  initMarqueeAutoScroll();
  initCadetHero();
  initReveal();
  initAnchorNav();
  updateScrollEffects();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', function () { measureMarquee(); requestScrollUpdate(); });
})();
