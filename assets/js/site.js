/* ============================================================
   Blue's Portfolio — site.js
   启动动画 / 导航 / 滚动浮现 / 3D 技能球 / Lottie / 作品筛选
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 启动动画 ---------- */
  function initBootSplash() {
    var splash = document.getElementById('boot-splash');
    if (!splash) return;
    var bar = splash.querySelector('.boot-splash-bar > i');
    var pct = document.getElementById('boot-splash-pct');
    var p = 0;
    var timer = setInterval(function () {
      p = Math.min(100, p + Math.random() * 16 + 6);
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p) + '%';
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          splash.classList.add('boot-splash--out');
          document.documentElement.classList.remove('boot-splash-active');
          document.body.classList.remove('boot-splash-active');
        }, 220);
      }
    }, 130);
  }

  /* ---------- 导航 ---------- */
  function initNav() {
    var toggle = document.querySelector('.navbar-toggle');
    var menu = document.querySelector('.navbar-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('active');
      var icon = toggle.querySelector('.navbar-toggle-icon');
      var open = menu.classList.contains('active');
      if (icon) icon.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
  }

  /* ---------- 滚动浮现 ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.scroll-reveal');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle('is-revealed', en.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) {
      if (el.classList.contains('scroll-reveal--hero')) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.classList.add('is-revealed'); });
        });
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- 3D 技能球（纯 JS 实现球面标签旋转） ---------- */
  function initSkillSphere() {
    var wrap = document.querySelector('.skill-sphere');
    if (!wrap) return;
    var labelsBox = wrap.querySelector('.skill-sphere-labels');
    var canvas = wrap.querySelector('.skill-sphere-canvas');
    var pool = ['Figma', 'Axure RP', '即时设计', 'ChatGPT Image 2', 'Photoshop', 'Illustrator', 'OpenAI Codex', 'WorkBuddy', 'TRAE', 'Bootstrap', 'HTML5', 'CSS3', 'JavaScript', '即梦AI', 'Premiere Pro', 'After Effects', '可灵AI', '剪映'];
    var COUNT = 30;
    var R = 2.1;
    var camZ = 6.2;
    var camY = 0.15;
    var fov = 45;
    var golden = Math.PI * (3 - Math.sqrt(5));
    var nodes = [];

    var mobile = window.innerWidth <= 767;

    // Fibonacci 球面分布
    for (var i = 0; i < COUNT; i++) {
      var l = 1 - (i / Math.max(COUNT - 1, 1)) * 2;
      var rr = Math.sqrt(Math.max(0, 1 - l * l));
      var theta = golden * i;
      var jitter = (Math.random() - 0.5) * 0.08;
      var scale = 1 + jitter;
      var dot = (mobile ? 4 + Math.round(Math.random() * 2) : 6 + Math.round(Math.random() * 3));
      var label = pool[i % pool.length];
      var el = document.createElement('div');
      el.className = 'skill-node';
      el.style.opacity = String(0.1 + Math.random() * 0.8);
      var d = document.createElement('span');
      d.className = 'skill-node-dot';
      d.style.width = dot + 'px';
      d.style.height = dot + 'px';
      var s = document.createElement('span');
      s.className = 'skill-node-label';
      s.textContent = label;
      el.appendChild(d);
      el.appendChild(s);
      labelsBox.appendChild(el);
      nodes.push({
        el: el,
        x: Math.cos(theta) * rr * R * scale,
        y: l * R * scale,
        z: Math.sin(theta) * rr * R * scale
      });
    }

    var rotY = 0;
    var rotX = 0.1;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;

    function project(n, W, H) {
      var cy = Math.cos(rotY), sy = Math.sin(rotY);
      var cx = Math.cos(rotX), sx = Math.sin(rotX);
      var x1 = n.x * cy + n.z * sy;
      var z1 = -n.x * sy + n.z * cy;
      var y1 = n.y * cx - z1 * sx;
      var z2 = n.y * sx + z1 * cx;
      var z = z2 - camZ;
      var f = (H / 2) / Math.tan((fov * Math.PI / 180) / 2);
      var px = W / 2 + (x1 * f) / -z;
      var py = H / 2 + ((y1 + camY) * f) / -z;
      return { px: px, py: py, z: z, front: z < 0 };
    }

    function render() {
      var W = wrap.clientWidth;
      var H = wrap.clientHeight;
      if (!W || !H) return;
      if (canvas) {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
          canvas.width = W * dpr;
          canvas.height = H * dpr;
        }
      }
      nodes.forEach(function (n) {
        var p = project(n, W, H);
        n.el.style.transform = 'translate(-50%, -50%) translate(' + p.px.toFixed(2) + 'px,' + p.py.toFixed(2) + 'px)';
        n.el.style.zIndex = String(Math.round((p.front ? 30 : 0) + Math.max(0, -p.z * 5)));
        if (!dragging && !p.front) n.el.style.opacity = '0.15';
      });
    }

    function tick() {
      if (!dragging) {
        rotY += 0.0021;
      }
      render();
      requestAnimationFrame(tick);
    }

    wrap.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      wrap.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      rotY += (e.clientX - lastX) * 0.005;
      rotX = Math.max(-1.2, Math.min(1.2, rotX + (e.clientY - lastY) * 0.003));
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener('pointerup', function () {
      dragging = false;
      wrap.style.cursor = 'grab';
    });
    window.addEventListener('resize', render);
    wrap.style.cursor = 'grab';
    tick();
  }

  /* ---------- Lottie 动画 ---------- */
  function initLottie() {
    if (typeof lottie === 'undefined') return;
    document.querySelectorAll('[data-lottie]').forEach(function (el) {
      var src = el.getAttribute('data-lottie');
      if (!src) return;
      fetch(src)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          lottie.loadAnimation({
            container: el,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: data
          });
        })
        .catch(function () { /* 动画加载失败时静默处理 */ });
    });
  }

  /* ---------- 关于页技能条 ---------- */
  function initSkillBars() {
    var bars = document.querySelectorAll('.progress-fill');
    if (!bars.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var fill = en.target;
        fill.style.width = fill.getAttribute('data-width') || fill.style.width;
        io.unobserve(fill);
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) {
      b.setAttribute('data-width', b.style.width);
      b.style.width = '0';
      io.observe(b);
    });
  }

  /* ---------- 作品集分类筛选 ---------- */
  function initListingFilter() {
    var nav = document.querySelector('.category-nav');
    if (!nav) return;
    var items = Array.prototype.slice.call(nav.querySelectorAll('.category-item'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.works-grid .work-item'));
    var title = document.querySelector('.listing-header h1');
    var count = document.querySelector('.listing-count');
    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.category-item');
      if (!btn) return;
      items.forEach(function (b) { b.classList.toggle('active', b === btn); });
      var cat = btn.getAttribute('data-category') || '';
      var shown = 0;
      cards.forEach(function (card) {
        var match = !cat || card.getAttribute('data-category') === cat;
        card.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      if (title) title.textContent = btn.textContent.trim();
      if (count) count.textContent = '共 ' + shown + ' 个作品';
      var scroller = document.querySelector('.listing-cards-scroll');
      if (scroller) scroller.scrollTop = 0;
    });
  }

  /* ---------- 作品详情弹窗 ---------- */
  function formatDate(d) {
    if (!d) return '';
    if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return d;
    var parts = d.slice(0, 10).split('-');
    return parseInt(parts[0], 10) + '年' + parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
  }

  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'work-modal work-modal-overlay';
    overlay.innerHTML =
      '<button type="button" class="work-modal-close" aria-label="关闭">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<div class="work-modal-container"><div class="work-modal-content"></div></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function fillModal(content, w) {
    if (w.protected) {
      content.innerHTML =
        '<div class="password-protected"><form class="password-form">' +
        '<h2>密码保护</h2><p>此作品受密码保护，请输入访问密码</p>' +
        '<div class="form-group"><label for="work-pwd">访问密码</label>' +
        '<input class="password-input" id="work-pwd" type="password" placeholder="请输入密码"></div>' +
        '<button class="submit-button" type="submit">确认</button>' +
        '<p class="error-message"></p></form></div>';
      var form = content.querySelector('.password-form');
      var err = content.querySelector('.error-message');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        err.textContent = '密码错误，请重试';
      });
      return;
    }
    var html = '<div class="work-modal-header"><div class="work-modal-header-top">' +
      '<h1></h1><div class="work-modal-header-meta">' +
      (w.category ? '<span class="work-category-tag"></span>' : '') +
      (w.project_url ? '<a class="work-project-link" target="_blank" rel="noopener noreferrer" href="#">查看项目链接</a>' : '') +
      '</div></div>' +
      (w.description ? '<p class="work-description"></p>' : '') +
      '</div><div class="work-modal-body">';
    if (w.images.length) {
      html += '<div class="work-gallery">' + w.images.map(function (src) {
        return '<div class="work-media-slot"><img src="' + src + '" alt="" loading="lazy"></div>';
      }).join('') + '</div>';
    }
    var info = '';
    if (w.tech) info += '<div class="info-block"><h2 class="info-label">技术栈</h2><p class="info-text"></p></div>';
    if (w.date) info += '<p class="info-line"></p>';
    if (w.client) info += '<p class="info-line"></p>';
    if (info) html += '<div class="work-extra-info">' + info + '</div>';
    html += '</div>';
    content.innerHTML = html;
    content.querySelector('h1').textContent = w.title;
    if (w.category) content.querySelector('.work-category-tag').textContent = w.category;
    if (w.project_url) {
      var link = content.querySelector('.work-project-link');
      link.href = /^https?:\/\//i.test(w.project_url) ? w.project_url : 'https://' + w.project_url;
    }
    if (w.description) content.querySelector('.work-description').textContent = w.description;
    if (w.tech) content.querySelector('.info-text').textContent = w.tech;
    var lines = content.querySelectorAll('.work-extra-info .info-line');
    var li = 0;
    if (w.date && lines[li]) lines[li++].textContent = formatDate(w.date);
    if (w.client && lines[li]) lines[li].textContent = '客户：' + w.client;
  }

  function initWorkModal() {
    var data = window.WORKS_DATA;
    if (!data || !data.length) return;
    var byTitle = {};
    data.forEach(function (w) { byTitle[w.title] = w; });
    var overlay = null;
    var isOpen = false;

    function open(work) {
      if (!overlay) overlay = buildModal();
      fillModal(overlay.querySelector('.work-modal-content'), work);
      overlay.style.display = '';
      document.body.classList.add('work-modal-active');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      });
      overlay.scrollTop = 0;
      isOpen = true;
    }
    function close() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      document.body.classList.remove('work-modal-active');
      isOpen = false;
      setTimeout(function () { if (overlay) overlay.style.display = 'none'; }, 300);
    }

    document.addEventListener('click', function (e) {
      var card = e.target.closest('.work-item');
      if (!card || isOpen) return;
      var nameEl = card.querySelector('.work-name');
      var work = nameEl && byTitle[nameEl.textContent.trim()];
      if (work) open(work);
    });
    document.addEventListener('click', function (e) {
      if (!overlay || !isOpen) return;
      if (e.target.closest('.work-modal-close')) { close(); return; }
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initBootSplash();
    initNav();
    initReveal();
    initSkillSphere();
    initLottie();
    initSkillBars();
    initListingFilter();
    initWorkModal();
  });
})();
