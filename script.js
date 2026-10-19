(function () {
  "use strict";

  var data = window.PORTFOLIO;
  if (!data || !Array.isArray(data.projects)) {
    var failedGrid = document.querySelector("[data-work-grid]");
    if (failedGrid) failedGrid.innerHTML = '<p class="load-error">content.js 没有成功读取，请检查引号、逗号和括号。</p>';
    return;
  }

  var projects = data.projects.filter(function (project) { return project.visible !== false; });
  var activeCategory = "all";
  var lastFocused = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function text(value) { return value == null ? "" : String(value); }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (node) { node.textContent = text(value); });
  }

  function safeUrl(value) {
    var url = text(value).trim();
    if (!url) return "";
    if (/^(https?:|mailto:|tel:|#)/i.test(url)) return url;
    if (/^(?:\.\/|\.\.\/|\/)?[^<>:"|?*]+$/i.test(url)) return url;
    return "";
  }

  function inferredType(item) {
    if (item.type) return String(item.type).toLowerCase();
    var src = text(item.src).split("?")[0].toLowerCase();
    if (/\.pdf$/.test(src)) return "pdf";
    if (/\.(mp4|webm)$/.test(src)) return "video";
    if (/\.(jpg|jpeg|png|webp|gif|avif)$/.test(src)) return "image";
    return "file";
  }

  function imageMarkup(src, alt) {
    if (!src) {
      return '<div class="media-placeholder"><strong>封面待添加</strong><span>在 content.js 中填写素材路径</span></div>';
    }
    return '<img src="' + esc(src) + '" alt="' + esc(alt || "") + '" loading="lazy" decoding="async">';
  }

  function assetMarkup(item, project, index) {
    var src = safeUrl(item.src);
    if (!src) return "";
    var type = inferredType(item);
    var title = text(item.title) || (project.titleZh + " · 素材 " + (index + 1));

    if (type === "video") {
      var poster = safeUrl(item.poster);
      return '<figure class="asset asset--video"><video controls playsinline preload="metadata"' +
        (poster ? ' poster="' + esc(poster) + '"' : "") + '><source src="' + esc(src) + '">你的浏览器暂不支持此视频格式。</video>' +
        '<figcaption><span>' + esc(title) + '</span><a href="' + esc(src) + '" target="_blank" rel="noopener">单独打开 ↗</a></figcaption></figure>';
    }

    if (type === "pdf") {
      return '<section class="asset asset--pdf"><div class="file-head"><span class="file-type">PDF</span><strong>' + esc(title) +
        '</strong><a href="' + esc(src) + '" target="_blank" rel="noopener">打开 / 下载 ↗</a></div><iframe src="' + esc(src) +
        '#view=FitH" title="' + esc(title) + '" loading="lazy"></iframe></section>';
    }

    if (type === "link") {
      return '<a class="asset asset--file" href="' + esc(src) + '" target="_blank" rel="noopener"><span class="file-type">LINK</span><strong>' +
        esc(title) + '</strong><span>打开 ↗</span></a>';
    }

    if (type === "file") {
      return '<a class="asset asset--file" href="' + esc(src) + '" download><span class="file-type">FILE</span><strong>' +
        esc(title) + '</strong><span>下载 ↗</span></a>';
    }

    return '<figure class="asset asset--image">' + imageMarkup(src, item.alt || title) +
      (item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : "") + '</figure>';
  }

  function sectionMarkup(section, project, index) {
    var type = section.type || "image";
    var title = section.title || "";
    var head = title ? '<div class="content-section__head"><p class="eyebrow">' + String(index + 1).padStart(2, "0") + '</p><h3>' + esc(title) + '</h3></div>' : '';
    if (type === "gallery") {
      var images = Array.isArray(section.images) ? section.images : [];
      var layout = section.layout === "grid" ? "grid" : "editorial";
      var gallery = images.map(function (item, i) {
        var media = typeof item === "string" ? {src:item} : item;
        if (!media || typeof media !== "object") return "";
        var src = safeUrl(media.src);
        if (!src) return "";
        var caption = media.caption || "";
        var alt = media.alt || project.titleZh + ' · ' + (i + 1);
        var visual;
        if (inferredType(media) === "video") {
          var poster = safeUrl(media.poster);
          var autoplay = media.autoplay === true && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          visual = '<video controls muted playsinline preload="metadata" aria-label="' + esc(alt) + '"' + (poster ? ' poster="' + esc(poster) + '"' : '') + (autoplay ? ' autoplay' : '') + (media.loop === true ? ' loop' : '') + '><source src="' + esc(src) + '">你的浏览器暂不支持此视频格式。</video>';
        } else {
          visual = '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">';
        }
        return '<figure class="gallery-item">' + visual + (caption ? '<figcaption>' + esc(caption) + '</figcaption>' : '') + '</figure>';
      }).join("");
      return '<section class="content-section">' + head + '<div class="project-gallery project-gallery--' + layout + '">' + gallery + '</div></section>';
    }
    if (type === "text") {
      return '<section class="content-section">' + head + '<div class="content-section__text">' + (section.zh ? '<p>' + esc(section.zh) + '</p>' : '') + (section.en ? '<p class="muted-copy">' + esc(section.en) + '</p>' : '') + '</div></section>';
    }
    if (type === "files") {
      var items = Array.isArray(section.items) ? section.items : [];
      var files = items.map(function (item, i) { return assetMarkup({type:item.type || "link", src:item.src, title:item.title}, project, i); }).join("");
      return '<section class="content-section">' + head + '<div class="section-files">' + files + '</div></section>';
    }
    var body = assetMarkup(section, project, index);
    return '<section class="content-section content-section--' + esc(type) + '">' + head + body + (section.note ? '<p class="section-note">' + esc(section.note) + '</p>' : '') + '</section>';
  }

  function projectCard(project, index) {
    var featured = project.featured === true || (!projects.some(function (p) { return p.featured === true; }) && index === 0);
    var cover = window.PORTFOLIO_COVER.normalize(project.cover);
    return '<a class="project-card' + (featured ? ' project-card--featured' : '') + '" href="#project-' + esc(project.id) + '" data-project-link>' +
      '<div class="project-card__visual cover-canvas" style="background:' + esc(cover.background) + '">' + (cover.src ? window.PORTFOLIO_COVER.media(cover, project.coverAlt || project.titleZh).outerHTML : imageMarkup('', project.titleZh)) +
      '<span class="project-card__number">' + String(index + 1).padStart(2, "0") + '</span><span class="project-card__open">↗</span></div>' +
      '<div class="project-card__meta"><div><p>' + esc(project.category) + ' · ' + esc(project.year) + '</p><h3>' + esc(project.titleZh) +
      '</h3><span>' + esc(project.titleEn) + '</span></div><b>↗</b></div><p class="project-card__summary">' + esc(project.summary) + '</p></a>';
  }

  function detailMarkup(project, index) {
    var sections = Array.isArray(project.sections) ? project.sections : [];
    var sectionHtml = sections.map(function (section, i) {
      return sectionMarkup(section, project, i);
    }).join("");
    var links = Array.isArray(project.links) ? project.links : [];
    var linkMarkup = links.map(function (item) {
      var url = safeUrl(item.url);
      return url ? '<a class="text-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(item.label || "项目链接") + ' ↗</a>' : "";
    }).join("");
    var next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
    var cover = safeUrl(window.PORTFOLIO_COVER.normalize(project.cover).src);

    return '<section class="project-detail" id="project-' + esc(project.id) + '" role="dialog" aria-modal="true" aria-labelledby="title-' + esc(project.id) + '" hidden>' +
      '<header class="detail-bar"><a href="#work">于卓平 / PORTFOLIO</a><span>' + String(index + 1).padStart(2, "0") + ' / ' + String(projects.length).padStart(2, "0") +
      '</span><button type="button" data-close>关闭 <small>ESC</small></button></header><div class="detail-scroll"><article class="detail-content">' +
      '<p class="eyebrow">' + esc(project.category) + ' · ' + esc(project.year) + '</p><h2 id="title-' + esc(project.id) + '">' + esc(project.titleZh) + '</h2>' +
      '<p class="detail-title-en">' + esc(project.titleEn) + '</p><p class="detail-role">' + esc(project.role) + '</p><p class="detail-summary">' + esc(project.summary) + '</p>' +
      (project.descriptionEn ? '<p class="detail-en">' + esc(project.descriptionEn) + '</p>' : "") +
      (cover ? '<div class="detail-cover">' + (window.PORTFOLIO_COVER.isVideo(project.cover) ? '<video controls playsinline preload="metadata" style="width:100%;max-height:76vh;object-fit:contain" src="' + esc(cover) + '"></video>' : imageMarkup(cover, project.coverAlt || project.titleZh)) + '</div>' : "") +
      (sectionHtml ? '<div class="detail-sections">' + sectionHtml + '</div>' : '<div class="detail-empty">详情素材尚未添加。请在 Manager 中添加 Video / Gallery / PDF 等模块。</div>') +
      (linkMarkup ? '<div class="detail-links">' + linkMarkup + '</div>' : "") +
      (next ? '<nav class="detail-next"><span>NEXT PROJECT</span><a href="#project-' + esc(next.id) + '">' + esc(next.titleZh) + ' →</a></nav>' : "") +
      '</article></div></section>';
  }

  function renderFilters() {
    var host = document.querySelector("[data-filters]");
    if (!host) return;
    var configured = Array.isArray(data.categories) ? data.categories : [];
    var used = projects.map(function (p) { return p.category; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    var list = configured.filter(function (c) { return c.id === "all" || used.indexOf(c.id) !== -1; });
    if (!list.length) list = [{ id: "all", label: "全部作品" }].concat(used.map(function (id) { return { id: id, label: id }; }));
    host.innerHTML = list.map(function (item) {
      return '<button type="button" class="filter-button' + (item.id === activeCategory ? ' is-active' : '') + '" data-filter="' + esc(item.id) + '" aria-pressed="' + (item.id === activeCategory) + '">' + esc(item.label) + '</button>';
    }).join("");
  }

  function renderGrid() {
    var grid = document.querySelector("[data-work-grid]");
    var empty = document.querySelector("[data-empty-state]");
    if (!grid) return;
    var visible = projects.filter(function (p) { return activeCategory === "all" || p.category === activeCategory; });
    grid.innerHTML = visible.map(projectCard).join("");
    window.PORTFOLIO_COVER.refresh(grid);
    if (empty) empty.hidden = visible.length !== 0;
    document.querySelectorAll("[data-filter]").forEach(function (button) {
      var active = button.getAttribute("data-filter") === activeCategory;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderAboutPage() {
    if (!window.PORTFOLIO_ABOUT) return;
    var page = window.PORTFOLIO_ABOUT.read(data.aboutPage);
    setText("[data-about-eyebrow]", page.eyebrow);
    var headline = document.querySelector("[data-about-headline]");
    if (headline) {
      headline.replaceChildren();
      var value = page.headline, star = /\*$/.test(value);
      if (star) value = value.slice(0, -1);
      var lines = value.split(/\r?\n/);
      if (lines.length === 1) {
        var spaces = [];for (var i=0;i<value.length;i++) if(value[i]===" ")spaces.push(i);
        if(spaces.length){var cut=spaces.reduce(function(a,b){return Math.abs(b-value.length*.52)<Math.abs(a-value.length*.52)?b:a;});lines=[value.slice(0,cut),value.slice(cut+1)];}
      }
      lines.forEach(function(line,i){if(i)headline.appendChild(document.createElement("br"));var part=document.createElement(i?"span":"span");part.className=i?"about-headline__second":"about-headline__first";part.textContent=line;headline.appendChild(part);});
      if(star){var mark=document.createElement("i");mark.textContent="*";headline.appendChild(mark);}
    }
    var paragraphs = document.querySelector("[data-about-paragraphs]");
    if(paragraphs){paragraphs.replaceChildren();page.paragraphs.forEach(function(text,i){var p=document.createElement("p");if(!i)p.className="about-copy__lead";p.textContent=text;paragraphs.appendChild(p);});}
    setText("[data-about-place]",page.place);setText("[data-about-coffee]",page.coffeeNote);
    setText("[data-about-outside]",page.outsideOfWork.join(" / "));setText("[data-about-cats]",page.catsNote);
    [["[data-about-interests]",page.interests],["[data-about-languages]",page.languages]].forEach(function(pair){var node=document.querySelector(pair[0]);if(!node)return;node.replaceChildren();pair[1].forEach(function(text){var p=document.createElement("p");p.textContent=text;node.appendChild(p);});});
  }

  function renderFooter() {
    var about = data.about || {};
    var host = document.querySelector("[data-footer-grid]");
    if (!host) return;
    var resume = safeUrl(about.resume);
    var email = text(about.email).trim();
    var socials = (about.socials || []).map(function (social) {
      var url = safeUrl(social.url);
      return url ? '<li><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(social.label) + ' ↗</a></li>' : "";
    }).join("");
    host.innerHTML = '<section class="footer-block"><p class="eyebrow">' + esc(data.site.cvEyebrow) + '</p><h3>' + esc(data.site.cvTitle) + '</h3>' +
      (resume ? '<a class="text-link" href="' + esc(resume) + '" target="_blank" rel="noopener">' + esc(about.resumeLabel || "下载简历") + ' ↗</a>' : '<p class="footer-note">' + esc(data.site.cvEmptyNote) + '</p>') + '</section>' +
      '<section class="footer-block" id="contact"><p class="eyebrow">' + esc(data.site.contactEyebrow) + '</p><h3>' + esc(data.site.contactTitle) + '</h3>' +
      (email ? '<a class="text-link" href="mailto:' + esc(email) + '">' + esc(email) + ' ↗</a>' : '') +
      '<p class="footer-note">' + esc(about.contactNote) + '</p>' + (socials ? '<ul class="social-list">' + socials + '</ul>' : "") + '</section>';
    var heroResume = document.querySelector("[data-resume-link]");
    if (heroResume) {
      if (resume) {heroResume.href = resume;heroResume.hidden = false;}
      else heroResume.hidden = true;
    }
  }

  function currentDetail() {
    var id = window.location.hash.replace(/^#/, "");
    return id.indexOf("project-") === 0 ? document.getElementById(id) : null;
  }

  function syncDetails() {
    var current = currentDetail();
    document.querySelectorAll(".project-detail").forEach(function (detail) {
      var active = detail === current;
      detail.hidden = !active;
      detail.setAttribute("aria-hidden", String(!active));
    });
    document.body.classList.toggle("detail-open", Boolean(current));
    if (current) {
      var scroll = current.querySelector(".detail-scroll");
      if (scroll) scroll.scrollTop = 0;
      var close = current.querySelector("[data-close]");
      if (close) close.focus({ preventScroll: true });
    } else if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  }

  function renderHomePage() {
    var home=window.PORTFOLIO_HOME.read(data.homePage),hero=document.querySelector(".hero");
    if(!hero)return;
    function set(selector,value){var node=hero.querySelector(selector);if(node)node.textContent=value;}
    set("[data-hero-eyebrow]",[home.portfolioLabel,home.year].filter(Boolean).join(" · "));
    set(".hero__edition",home.cornerLabel);set(".hero__visual",home.visualWord);
    var motion=hero.querySelector(".hero__motion");
    if(motion){var textNode=Array.from(motion.childNodes).find(function(node){return node.nodeType===3});if(textNode)textNode.nodeValue=home.motionWord;else motion.insertBefore(document.createTextNode(home.motionWord),motion.firstChild);}
    set(".hero__index-label",home.practiceLabel);
    var index=hero.querySelector(".hero__index");
    if(index){
      var rows=Array.from(index.querySelectorAll(":scope > p"));
      home.practices.forEach(function(practice,i){var row=rows[i]||document.createElement("p"),number=row.querySelector("span")||document.createElement("span");number.textContent=String(i+1).padStart(2,"0");row.replaceChildren(number,document.createTextNode(" "+practice));if(!rows[i])index.appendChild(row);});
      rows.slice(home.practices.length).forEach(function(row){row.remove()});
    }
    set("[data-name-zh]",home.nameZh);set("[data-name-en]",home.nameEn);set("[data-role]",home.roleZh);set(".hero__role-en",home.roleEn);
    set("[data-intro-zh]",home.introZh);set("[data-intro-en]",home.introEn);
    var fields=hero.querySelector("[data-fields]");if(fields){fields.replaceChildren();home.fields.forEach(function(field){var span=document.createElement("span");span.textContent=field;fields.appendChild(span);});}
  }

  function renderSiteCopy() {
    var s=data.site;
    function put(selector,key){var node=document.querySelector(selector);if(node)node.textContent=s[key];}
    function firstText(selector,key){var node=document.querySelector(selector);if(!node)return;var t=Array.from(node.childNodes).find(function(n){return n.nodeType===3});if(t)t.nodeValue=s[key];}
    put('#work .eyebrow','selectedEyebrow');firstText('#work .section__title','selectedTitleZh');put('#work .section__title span','selectedTitleEn');
    put('.pg-eyebrow','playgroundEyebrow');firstText('#pg-heading','playgroundTitle');put('#pg-heading span','playgroundSubtitle');put('.pg-intro p:first-child','playgroundIntroZh');put('.pg-intro p:nth-child(2)','playgroundIntroEn');put('[data-pg-demo]','playgroundDemoNote');
    put('.about-cluster__place h3','placeLabel');put('.about-cluster__languages h3','languagesLabel');put('.about-cluster__outside h3','outsideLabel');put('.footer__bottom > span:last-child','footerLine');
    put('[data-resume-link]','heroCVLabel');put('.hero__actions a[href="#contact"]','heroContactLabel');put('.topbar__nav a[href="#work"]','navWork');put('.topbar__nav a[href="#about"]','navAbout');put('.topbar__nav a[href="#contact"]','navContact');
  }
  function render() {
    window.PORTFOLIO_SITE.normalize(data);
    var site = data.site || {};
    document.title = [site.nameZh, site.nameEn].filter(Boolean).join(" ") + " — " + text(site.role);
    var meta = document.querySelector('meta[name="description"]');
    if (meta && site.pageDescription) meta.content = site.pageDescription;
    setText("[data-site-name]", [site.nameZh, site.nameEn].filter(Boolean).join(" "));
    setText("[data-project-count]", String(projects.length).padStart(2, "0") + " PROJECTS");
    renderSiteCopy();
    renderHomePage();
    renderFilters();
    renderGrid();
    renderFooter();
    renderAboutPage();
    var detailHost = document.querySelector("[data-detail-host]");
    if (detailHost) detailHost.innerHTML = projects.map(detailMarkup).join("");
    document.querySelectorAll("[data-year]").forEach(function (node) { node.textContent = String(new Date().getFullYear()); });
    syncDetails();
  }

  document.addEventListener("click", function (event) {
    var filter = event.target.closest("[data-filter]");
    if (filter) {
      activeCategory = filter.getAttribute("data-filter") || "all";
      renderGrid();
      return;
    }
    var projectLink = event.target.closest("[data-project-link]");
    if (projectLink) lastFocused = projectLink;
    var close = event.target.closest("[data-close]");
    if (close) {
      event.preventDefault();
      history.replaceState(null, "", window.location.pathname + window.location.search + "#work");
      syncDetails();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && currentDetail()) {
      history.replaceState(null, "", window.location.pathname + window.location.search + "#work");
      syncDetails();
    }
  });

  document.addEventListener("error", function (event) {
    if (event.target && event.target.tagName === "IMG") {
      var img = event.target;
      var parent = img.parentElement;
      img.remove();
      if (parent && !parent.querySelector(".media-placeholder")) {
        parent.insertAdjacentHTML("beforeend", '<div class="media-placeholder"><strong>素材加载失败</strong><span>请检查文件路径与大小写</span></div>');
      }
    }
  }, true);

  window.addEventListener("hashchange", syncDetails);

  var topbar = document.querySelector(".topbar");
  if (topbar) {
    var onScroll = function () { topbar.classList.toggle("is-stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  render();
})();

/* Independent camera enhancement: no dependency on portfolio data/rendering. */
(function () {
  "use strict";
  var hero = document.querySelector("[data-hero-camera]");
  if (!hero || !window.matchMedia) return;
  var stage = hero.querySelector("[data-hero-stage]");
  if (!stage) return;
  var layers = hero.querySelectorAll("[data-hero-layer]");
  var allowed = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  var x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, lastTime = 0;
  function reset() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    x = y = targetX = targetY = 0;
    stage.style.removeProperty("transform");
    layers.forEach(function (layer) { layer.style.removeProperty("transform"); });
  }
  function tick(time) {
    frame = 0;
    if (!allowed.matches || document.hidden) { reset(); return; }
    var dt = lastTime ? Math.min(time - lastTime, 64) : 16.67;
    lastTime = time;
    var ease = 1 - Math.exp(-dt / 135);
    x += (targetX - x) * ease; y += (targetY - y) * ease;
    var settled = Math.abs(targetX - x) + Math.abs(targetY - y) < 0.0005;
    if (settled) { x = targetX; y = targetY; }
    stage.style.transform = "rotateX(" + (-y * 1.1) + "deg) rotateY(" + (x * 1.5) + "deg)";
    layers.forEach(function (layer) {
      var depth = Number(layer.getAttribute("data-hero-layer")) || 0;
      layer.style.transform = "translate3d(" + (x * depth) + "px," + (y * depth * 0.6) + "px,0)";
    });
    if (!settled) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function start() { if (!frame && allowed.matches) frame = requestAnimationFrame(tick); }
  function home() { targetX = targetY = 0; start(); }
  hero.addEventListener("pointermove", function (event) {
    if (!allowed.matches || event.pointerType !== "mouse") return;
    var rect = hero.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    start();
  }, { passive: true });
  hero.addEventListener("pointerleave", home);
  hero.addEventListener("pointercancel", home);
  window.addEventListener("blur", home);
  document.addEventListener("visibilitychange", function () { if (document.hidden) reset(); });
  if (allowed.addEventListener) allowed.addEventListener("change", reset);
  else if (allowed.addListener) allowed.addListener(reset);
})();
