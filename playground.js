(function () {
  'use strict';
  var config = window.PLAYGROUND;
  var section = document.getElementById('playground');
  if (!section || !config || config.enabled === false) return;
  function source(value) {
    var url = String(value || '').trim();
    if (!url || /^(?:javascript|data|vbscript):/i.test(url) || /[<>\x00-\x1f]/.test(url)) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:/i.test(url)) return '';
    return url;
  }
  var items = (Array.isArray(config.items) ? config.items : []).filter(function (item) {
    return item && item.visible !== false && (item.type === 'image' || item.type === 'video') && source(item.src);
  });
  if (!items.length) return;
  var grid = section.querySelector('[data-pg-grid]');
  var dialog = document.querySelector('[data-pg-dialog]');
  var detailMedia = dialog.querySelector('[data-pg-detail-media]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var records = [], layoutFrame = 0, detailOpen = false, focused = null;
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }
  /* Skyline packing supports contiguous column spans without changing DOM order. */
  function pack(entries, columns, gap, offsets) {
    var levels = Array.from({length: columns}, function (_, i) { return offsets && offsets[i] || 0; });
    var positions = entries.map(function (entry) {
      var span = Math.max(1, Math.min(columns, entry.span));
      var best = 0, top = Infinity;
      for (var i = 0; i <= columns - span; i++) {
        var y = Math.max.apply(null, levels.slice(i, i + span));
        if (y < top) { best = i; top = y; }
      }
      for (var j = best; j < best + span; j++) levels[j] = top + entry.height + gap;
      return {column: best, top: top};
    });
    return {positions: positions, height: Math.max.apply(null, levels) - gap};
  }
  function layout() {
    layoutFrame = 0;
    var width = grid.clientWidth;
    if (!width) return;
    var columns = window.innerWidth > 1180 ? 4 : window.innerWidth > 860 ? 3 : window.innerWidth > 380 ? 2 : 1;
    grid.setAttribute('data-layout-columns', String(columns));
    var gap = columns >= 3 ? 28 : columns === 2 ? 18 : 28;
    var cell = (width - gap * (columns - 1)) / columns;
    grid.classList.add('pg-grid--masonry');
    var entries = records.map(function (record) {
      var span = record.item.size === 'wide' ? Math.min(2, columns) : 1;
      // Very narrow mobile columns promote unusually wide media for legibility.
      // Desktop landscapes stay single-column unless explicitly marked wide.
      var w = record.media.naturalWidth || record.media.videoWidth || Number(record.item.width);
      var h = record.media.naturalHeight || record.media.videoHeight || Number(record.item.height);
      if (window.innerWidth <= 600 && columns === 2 && w > 0 && h > 0 && w / h > 1.8) span = 2;
      var width = cell * span + gap * (span - 1);
      var inset = columns === 1 ? 0 : record.item.size === 'small' ? width * .14 : record.item.size === 'tall' ? width * .035 : 0;
      record.width = width; record.inset = inset;
      record.card.style.width = (width - inset * 2) + 'px';
      return {span: span, height: record.card.getBoundingClientRect().height};
    });
    var result = pack(entries, columns, gap + (columns > 2 ? 16 : 10), columns > 2 ? [0, 32, 8, 46] : [0, 16]);
    records.forEach(function (record, i) {
      var pos = result.positions[i];
      record.card.style.transform = 'translate(' + (pos.column * (cell + gap) + record.inset) + 'px,' + pos.top + 'px)';
    });
    grid.style.height = Math.max(0, result.height) + 'px';
  }
  function scheduleLayout() { if (!layoutFrame) layoutFrame = requestAnimationFrame(layout); }
  function syncVideo(record) {
    var video = record.media;
    if (record.item.type !== 'video') return;
    var play = !reduced.matches && record.inView && !document.hidden && !detailOpen && !document.body.classList.contains('detail-open');
    video.autoplay = play;
    if (play) {
      var promise = video.play();
      if (promise) promise.then(function () {record.note.hidden = !video.paused;}).catch(function () {record.note.hidden = false;record.note.textContent = '查看 / 播放 ↗';});
    } else { video.pause(); record.note.hidden = false; record.note.textContent = reduced.matches ? 'MOTION · 点击查看' : 'MOTION ↗'; }
  }
  function syncVideos() { records.forEach(syncVideo); }
  var intersection = window.IntersectionObserver ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var record = records.find(function (record) {return record.card === entry.target;});
      if (record) { record.inView = entry.isIntersecting; syncVideo(record); }
    });
  }, {threshold: .08}) : null;
  function fail(media, parent) {
    media.addEventListener('error', function () {
      if (parent.querySelector('.pg-media-error')) return;
      media.hidden = true;
      parent.appendChild(element('p', 'pg-media-error', '素材暂时无法显示，请检查路径或文件格式。'));
      scheduleLayout();
    });
  }
  function show(item, trigger) {
    if (!dialog.showModal) { window.open(source(item.src), '_blank', 'noopener'); return; }
    focused = trigger;
    detailOpen = true; syncVideos();
    dialog.querySelector('#pg-detail-title').textContent = item.title || 'Visual study';
    dialog.querySelector('[data-pg-caption]').textContent = item.caption || '';
    detailMedia.replaceChildren();
    var media = element(item.type === 'video' ? 'video' : 'img');
    if (item.type === 'video') {
      media.controls = true; media.playsInline = true; media.preload = 'metadata';
      if (source(item.poster)) media.poster = source(item.poster);
    } else { media.alt = item.alt || item.title || ''; }
    fail(media, detailMedia);media.src = source(item.src);detailMedia.appendChild(media);
    document.body.classList.add('pg-view-open');dialog.showModal();
    dialog.querySelector('[data-pg-close]').focus();
    /* Detail playback is explicit and has controls, including sound. */
  }
  function close() { if (dialog.open) dialog.close(); }
  dialog.querySelector('[data-pg-close]').addEventListener('click', close);
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  dialog.addEventListener('close', function () {
    var video = detailMedia.querySelector('video');if (video) {video.pause();video.removeAttribute('src');video.load();}
    detailMedia.replaceChildren();document.body.classList.remove('pg-view-open');detailOpen = false;
    syncVideos();if (focused && focused.isConnected) focused.focus({preventScroll:true});
  });
  items.forEach(function (item, index) {
    var size = ['small','medium','wide','tall'].indexOf(item.size) !== -1 ? item.size : 'medium';
    var card = element('article', 'pg-card pg-card--' + size);
    var button = element('button', 'pg-open');button.type = 'button';button.setAttribute('aria-label', '查看：' + (item.title || 'Visual study ' + (index + 1)));
    var frame = element('span', 'pg-media');
    var media = element(item.type === 'video' ? 'video' : 'img');
    if (Number(item.width) > 0 && Number(item.height) > 0) {media.width = Number(item.width);media.height = Number(item.height);}
    var note = element('span', 'pg-video-note', 'MOTION ↗');
    if (item.type === 'video') {
      media.muted = true;media.defaultMuted = true;media.loop = true;media.playsInline = true;media.preload = 'metadata';
      media.setAttribute('muted','');media.setAttribute('playsinline','');
      if (source(item.poster)) media.poster = source(item.poster);
      media.addEventListener('loadedmetadata', scheduleLayout);
    } else {media.alt = item.alt || item.title || '';media.loading = 'lazy';media.decoding = 'async';media.addEventListener('load', scheduleLayout);}
    fail(media, frame);media.src = source(item.src);frame.appendChild(media);
    if (item.type === 'video') frame.appendChild(note);
    frame.appendChild(element('span', 'pg-open__hint', '↗'));button.appendChild(frame);
    button.addEventListener('click', function () { show(item, button); });card.appendChild(button);
    var meta = element('div', 'pg-card__meta');meta.appendChild(element('h3', '', item.title || 'Untitled study'));
    meta.appendChild(element('span', '', String(index + 1).padStart(2,'0') + ' / ' + (item.type === 'video' ? 'MOTION' : 'IMAGE')));card.appendChild(meta);grid.appendChild(card);
    var record = {item:item,card:card,media:media,note:note,inView:!intersection};records.push(record);
    if (intersection) intersection.observe(card);
  });
  section.querySelector('[data-pg-count]').textContent = String(items.length).padStart(2,'0') + ' STUDIES';
  section.querySelector('[data-pg-demo]').hidden = config.demo !== true;
  section.hidden = false;
  if (window.ResizeObserver) {
    var resize = new ResizeObserver(scheduleLayout);resize.observe(grid);
    records.forEach(function (record) {resize.observe(record.card);});
  }
  window.addEventListener('resize', scheduleLayout, {passive:true});
  document.addEventListener('visibilitychange', syncVideos);window.addEventListener('hashchange', syncVideos);
  if (reduced.addEventListener) reduced.addEventListener('change', syncVideos);
  else if (reduced.addListener) reduced.addListener(syncVideos);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleLayout);
  scheduleLayout();syncVideos();
})();
