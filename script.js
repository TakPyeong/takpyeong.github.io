/* ==========================================================================
   Yu Zhuoping — Portfolio
   这份文件只做 4 件小事：
   1. 点击作品 → 打开对应的项目详情（用网址里的 # 控制，浏览器返回键也能用）
   2. Esc 或 Close 关闭详情
   3. 图片还没放好时，显示这张图应该存放的路径
   4. 页面滚动时的小动效
   内容都在 index.html 里改，这个文件一般不用动。
   ========================================================================== */

(function () {
  'use strict';

  var body = document.body;
  var details = Array.prototype.slice.call(document.querySelectorAll('.detail'));
  var lastFocused = null;

  /* ---------- 1 + 2：打开 / 关闭项目详情 ---------- */

  function activeDetail() {
    var id = window.location.hash.replace('#', '');
    if (!id) return null;
    var el = document.getElementById(id);
    return el && el.classList.contains('detail') ? el : null;
  }

  function sync() {
    var current = activeDetail();

    details.forEach(function (detail) {
      detail.hidden = detail !== current;
    });

    body.classList.toggle('is-locked', Boolean(current));

    if (current) {
      var scroller = current.querySelector('.detail__body');
      if (scroller) scroller.scrollTop = 0;

      if (!current.contains(document.activeElement)) {
        var closeBtn = current.querySelector('[data-close]');
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      }
    } else if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  }

  window.addEventListener('hashchange', sync);

  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;

    var link = event.target.closest('a[href^="#p-"]');
    if (link) {
      lastFocused = link;
      return; // 交给浏览器的 # 跳转，hashchange 会接管显示
    }

    var closeBtn = event.target.closest('[data-close]');
    if (closeBtn) {
      event.preventDefault();
      history.replaceState(null, '', window.location.pathname + window.location.search);
      sync();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!activeDetail()) return;

    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    sync();
  });

  sync();

  /* ---------- 3：图片缺省提示 ---------- */

  function checkImage(img) {
    var frame = img.closest('.media');
    if (!frame) return;

    if (img.complete && img.naturalWidth === 0) {
      frame.classList.add('is-missing');
      return;
    }
    img.addEventListener('error', function () {
      frame.classList.add('is-missing');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.media img'), checkImage);

  /* ---------- 4：滚动动效 ---------- */

  var topbar = document.querySelector('.topbar');
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 页脚年份 ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

})();
