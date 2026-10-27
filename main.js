document.documentElement.classList.add('js');

(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    function closeMenu() {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      closeMenu();
    });
  }

  var toast = document.querySelector('.toast');
  var toastTimer;
  function show(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 2500);
  }
  function fallbackCopy(value) {
    var area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      show('복사되었습니다');
    } catch (err) {
      show(value);
    }
    document.body.removeChild(area);
  }
  /* 네이버 지도: 기본은 모바일 장소 페이지, 데스크톱에서는 데스크톱 지도 주소로 교체 */
  if (!/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
    document.querySelectorAll('a[data-desktop-href]').forEach(function (a) {
      var href = a.getAttribute('data-desktop-href');
      if (href) a.setAttribute('href', href);
    });
  }
  document.querySelectorAll('.copy').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy') || '';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () {
          show('복사되었습니다: ' + value);
        }, function () { fallbackCopy(value); });
      } else {
        fallbackCopy(value);
      }
    });
  });

  var topbar = document.getElementById('topbar');
  if (topbar) {
    var onScroll = function () { topbar.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

(function () {
  var root = document.querySelector('.hero');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dots button'));
  var prev = root.querySelector('.prev');
  var next = root.querySelector('.next');
  var pauseBtn = root.querySelector('.hero-pause');
  if (!slides.length || !prev || !next) return;
  var index = 0;
  var timer = null;
  var paused = false;
  var hovering = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var delay = 7000;

  function show(n) {
    index = (n + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var on = i === index;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) slide.removeAttribute('inert');
      else slide.setAttribute('inert', '');
    });
    dots.forEach(function (dot, i) {
      var on = i === index;
      dot.setAttribute('aria-selected', on ? 'true' : 'false');
      dot.tabIndex = on ? 0 : -1;
    });
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function start() {
    if (paused || hovering || reduce || slides.length < 2) return;
    stop();
    timer = setInterval(function () { show(index + 1); }, delay);
  }
  prev.addEventListener('click', function () { show(index - 1); start(); });
  next.addEventListener('click', function () { show(index + 1); start(); });
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { show(i); start(); });
  });
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', paused ? '재생' : '일시정지');
      if (paused) stop();
      else start();
    });
  }
  var touchX = 0;
  var touchY = 0;
  var swiping = false;
  root.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || e.target.closest('a, button')) {
      swiping = false;
      return;
    }
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    swiping = true;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (!swiping || !e.changedTouches.length) return;
    swiping = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX;
    var dy = t.clientY - touchY;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    show(dx < 0 ? index + 1 : index - 1);
    start();
  }, { passive: true });
  root.addEventListener('mouseenter', function () { hovering = true; stop(); });
  root.addEventListener('mouseleave', function () { hovering = false; start(); });
  root.addEventListener('focusin', function () { hovering = true; stop(); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) { hovering = false; start(); }
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); start(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); start(); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });
  show(0);
  start();
})();

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    nodes.forEach(function (node) { node.classList.add('in'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8px 0px' });
  nodes.forEach(function (node) { observer.observe(node); });
})();

/* 교회소식·대표 영상. data/board.json 을 읽고, 쇼츠를 뺀 뒤 분류마다 새 영상부터 몇 편만 그립니다.
   HTML의 <!-- BOARD:START --> … <!-- BOARD:END --> 는 파일을 열었을 때의 기본 내용입니다. */
(function () {
  var grid = document.getElementById('vgrid');
  if (!grid) return;
  var current = 'all';
  var PER = { sermon: 3, praise: 2, prayer: 2, spoon: 3 };
  var ORDER = ['sermon', 'praise', 'prayer', 'spoon'];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function isShort(item) {
    if (!item) return true;
    if (item.is_short) return true;
    var url = String(item.url || '');
    if (url.indexOf('/shorts/') !== -1) return true;
    var kind = String(item.kind || '');
    if (kind.indexOf('쇼츠') !== -1) return true;
    var raw = String(item.raw_title || '');
    if (/#shorts/i.test(raw)) return true;
    return false;
  }
  function byViews(a, b) {
    /* 최신순: 올라온 시각이 늦은 영상이 먼저 */
    return String(b.published_kst || b.date_kst || '').localeCompare(String(a.published_kst || a.date_kst || ''));
  }
  function curate(items) {
    var list = (items || []).filter(function (item) { return item && item.title && !isShort(item); });
    var pinned = list.filter(function (item) { return item.pinned === true; });
    var pool = pinned.length ? pinned : list;
    var groups = {};
    pool.forEach(function (item) {
      var key = item.category || 'sermon';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    var chosen = [];
    ORDER.forEach(function (key) {
      var rows = (groups[key] || []).slice().sort(byViews);
      chosen = chosen.concat(rows.slice(0, PER[key] || 2));
    });
    return chosen;
  }
  function card(item, labels) {
    var meta = [item.kind, item.scripture ? '본문 ' + item.scripture : '', item.preacher].filter(Boolean).join(' · ');
    var thumb = item.thumb
      ? '<span class="thumb"><img loading="eager" src="' + esc(item.thumb) + '" alt="" width="480" height="360"><i class="play" aria-hidden="true"></i></span>'
      : '';
    return '<article class="vcard" data-cat="' + esc(item.category) + '" data-id="' + esc(item.id) + '"><a href="' + esc(item.url) + '" target="_blank" rel="noopener">' +
      thumb +
      '<span class="vbody"><span class="vcat c-' + esc(item.category) + '">' + esc(labels[item.category] || '') + '</span><b class="vtitle">' + esc(item.title) + '</b>' +
      (meta ? '<span class="vmeta">' + esc(meta) + '</span>' : '') +
      '<span class="vdate">' + esc(String(item.date_kst || '').replace(/-/g, '.')) + '</span>' +
      (item.summary ? '<span class="vsum">' + esc(item.summary) + '</span>' : '') +
      '</span></a></article>';
  }
  function apply() {
    var any = false;
    grid.querySelectorAll('.vcard').forEach(function (cardEl) {
      var show = current === 'all' || cardEl.getAttribute('data-cat') === current;
      cardEl.hidden = !show;
      if (show) any = true;
    });
    var empty = document.getElementById('vempty');
    if (empty) empty.hidden = any;
  }
  document.querySelectorAll('.fbtn').forEach(function (button) {
    button.addEventListener('click', function () {
      current = button.getAttribute('data-f') || 'all';
      document.querySelectorAll('.fbtn').forEach(function (other) {
        var on = other === button;
        other.classList.toggle('on', on);
        other.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
  });

  if (!window.fetch || location.protocol === 'file:') return;
  fetch('data/board.json', { cache: 'no-cache' }).then(function (res) {
    if (!res.ok) throw new Error('board');
    return res.json();
  }).then(function (data) {
    if (!data || !data.items || !data.items.length) return;
    var labels = {};
    (data.categories || []).forEach(function (cat) { labels[cat.id] = cat.label; });
    var picked = curate(data.items);
    if (picked.length) grid.innerHTML = picked.map(function (item) { return card(item, labels); }).join('');
    if (data.notices && data.notices.length) {
      var notices = document.getElementById('notices');
      if (notices) {
        notices.innerHTML = data.notices.map(function (notice) {
          var foot = [notice.date ? String(notice.date).replace(/-/g, '.') : '', notice.link ? '<a href="' + esc(notice.link) + '" target="_blank" rel="noopener">자세히 보기</a>' : ''].filter(Boolean).join(' · ');
          return '<article class="notice"><span class="ntag">' + esc(notice.tag || '소식') + '</span><h3>' + esc(notice.title) + '</h3><p>' + esc(notice.body) + '</p>' + (foot ? '<p class="ndate">' + foot + '</p>' : '') + '</article>';
        }).join('');
      }
    }
    var updated = document.getElementById('board-upd');
    if (updated && data.updated_kst) updated.textContent = '(목록 갱신: ' + String(data.updated_kst).slice(0, 10).replace(/-/g, '.') + ')';
    apply();
  }).catch(function () {});
})();
