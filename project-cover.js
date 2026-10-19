/* Shared Project Cover model and renderer: Manager preview = homepage canvas. */
(function () {
  'use strict';
  var DEFAULT_BACKGROUND = '#ecece7';
  function number(value, fallback, min, max) {
    var n = value == null || value === '' ? NaN : Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  }
  function color(value) {
    var text = String(value || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(text)) text = '#' + text.slice(1).split('').map(function(c){return c+c;}).join('');
    return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : '';
  }
  function safeSource(value) {
    var src=String(value || '').trim();
    if (!src || /[<>\x00-\x1f]/.test(src)) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(src) && !/^https?:/i.test(src)) return '';
    return src;
  }
  function normalize(value) {
    var raw = typeof value === 'string' ? {src:value} : value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.assign({},raw,{
      src:safeSource(raw.src), fit:raw.fit==='contain'?'contain':'cover',
      positionX:number(raw.positionX,50,0,100),positionY:number(raw.positionY,50,0,100),
      scale:number(raw.scale,1,1,1.6),background:color(raw.background)||DEFAULT_BACKGROUND
    });
  }
  function isVideo(value) {var c=normalize(value);return c.type==='video'||/\.(mp4|webm)(?:[?#]|$)/i.test(c.src);}
  function apply(canvas,value) {
    var cover=normalize(value),media=canvas.querySelector('[data-cover-media]');
    canvas.style.backgroundColor=cover.background;
    if(media){media.style.objectFit=cover.fit;media.style.objectPosition=cover.positionX+'% '+cover.positionY+'%';media.style.transformOrigin=cover.positionX+'% '+cover.positionY+'%';media.style.setProperty('--cover-scale',cover.scale);}
    return cover;
  }
  function media(value,alt,resolvedSource) {
    var cover=normalize(value),video=isVideo(cover),node=document.createElement(video?'video':'img');
    node.setAttribute('data-cover-media','');
    if(video){node.muted=true;node.defaultMuted=true;node.loop=true;node.playsInline=true;node.preload='metadata';node.setAttribute('muted','');node.setAttribute('loop','');node.setAttribute('playsinline','');if(!reduced.matches)node.setAttribute('autoplay','');node.setAttribute('aria-label',alt||'项目视频封面');}
    else{node.alt=alt||'';node.loading='lazy';node.decoding='async';}
    node.src=resolvedSource||cover.src;
    node.style.objectFit=cover.fit;node.style.objectPosition=cover.positionX+'% '+cover.positionY+'%';node.style.transformOrigin=cover.positionX+'% '+cover.positionY+'%';node.style.setProperty('--cover-scale',cover.scale);
    return node;
  }
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),videos=new Map();
  function sync(video) {
    var visible=videos.get(video);
    if(!video.isConnected||!visible||reduced.matches||document.hidden||document.body.classList.contains('detail-open')||document.body.classList.contains('pg-view-open')){video.autoplay=false;video.pause();return;}
    video.muted=true;video.autoplay=true;var promise=video.play();if(promise)promise.catch(function(){});
  }
  var observer=window.IntersectionObserver?new IntersectionObserver(function(entries){entries.forEach(function(entry){videos.set(entry.target,entry.isIntersecting);sync(entry.target);});},{threshold:.05}):null;
  function refresh(root) {
    videos.forEach(function(_,v){if(!v.isConnected){v.pause();if(observer)observer.unobserve(v);videos.delete(v);}});
    (root||document).querySelectorAll('video[data-cover-media]').forEach(function(v){if(!videos.has(v)){videos.set(v,!observer);if(observer)observer.observe(v);}sync(v);});
  }
  function syncAll(){videos.forEach(function(_,v){sync(v);});}
  document.addEventListener('visibilitychange',syncAll);window.addEventListener('hashchange',syncAll);
  if(reduced.addEventListener)reduced.addEventListener('change',syncAll);else if(reduced.addListener)reduced.addListener(syncAll);
  if(window.MutationObserver)new MutationObserver(syncAll).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.PORTFOLIO_COVER={normalize:normalize,color:color,media:media,apply:apply,isVideo:isVideo,refresh:refresh,defaultBackground:DEFAULT_BACKGROUND};
})();
