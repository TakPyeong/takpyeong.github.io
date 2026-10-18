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
        var src = typeof item === "string" ? item : item.src;
        var caption = typeof item === "string" ? "" : (item.caption || "");
        return '<figure class="gallery-item"><img src="' + esc(src) + '" alt="' + esc(project.titleZh + ' · ' + (i + 1)) + '" loading="lazy" decoding="async">' + (caption ? '<figcaption>' + esc(caption) + '</figcaption>' : '') + '</figure>';
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
    var cover = safeUrl(project.cover);
    return '<a class="project-card' + (featured ? ' project-card--featured' : '') + '" href="#project-' + esc(project.id) + '" data-project-link>' +
      '<div class="project-card__visual">' + imageMarkup(cover, project.coverAlt || project.titleZh) +
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
    var cover = safeUrl(project.cover);

    return '<section class="project-detail" id="project-' + esc(project.id) + '" role="dialog" aria-modal="true" aria-labelledby="title-' + esc(project.id) + '" hidden>' +
      '<header class="detail-bar"><a href="#work">于卓平 / PORTFOLIO</a><span>' + String(index + 1).padStart(2, "0") + ' / ' + String(projects.length).padStart(2, "0") +
      '</span><button type="button" data-close>关闭 <small>ESC</small></button></header><div class="detail-scroll"><article class="detail-content">' +
      '<p class="eyebrow">' + esc(project.category) + ' · ' + esc(project.year) + '</p><h2 id="title-' + esc(project.id) + '">' + esc(project.titleZh) + '</h2>' +
      '<p class="detail-title-en">' + esc(project.titleEn) + '</p><p class="detail-role">' + esc(project.role) + '</p><p class="detail-summary">' + esc(project.summary) + '</p>' +
      (project.descriptionEn ? '<p class="detail-en">' + esc(project.descriptionEn) + '</p>' : "") +
      (cover ? '<div class="detail-cover">' + imageMarkup(cover, project.coverAlt || project.titleZh) + '</div>' : "") +
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
    if (empty) empty.hidden = visible.length !== 0;
    document.querySelectorAll("[data-filter]").forEach(function (button) {
      var active = button.getAttribute("data-filter") === activeCategory;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderFooter() {
    var about = data.about || {};
    var host = document.querySelector("[data-footer-grid]");
    if (!host) return;
    var resume = safeUrl(about.resume);
    var email = text(about.email).trim();
    var profile = safeUrl(about.profile);
    var skills = (about.skills || []).map(function (skill) { return '<li>' + esc(skill) + '</li>'; }).join("");
    var socials = (about.socials || []).map(function (social) {
      var url = safeUrl(social.url);
      return url ? '<li><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(social.label) + ' ↗</a></li>' : "";
    }).join("");

    host.innerHTML = '<section class="footer-block footer-block--bio">' +
      (profile ? '<img src="' + esc(profile) + '" alt="' + esc(about.profileAlt || "个人照片") + '">' : "") +
      '<div><h3>视觉创作者</h3><p>' + esc(about.bioZh) + '</p><p class="footer-en">' + esc(about.bioEn) + '</p></div></section>' +
      '<section class="footer-block"><p class="eyebrow">CAPABILITIES</p><h3>创作方向</h3><ul>' + skills + '</ul></section>' +
      '<section class="footer-block"><p class="eyebrow">RESUME</p><h3>简历</h3>' +
      (resume ? '<a class="text-link" href="' + esc(resume) + '" target="_blank" rel="noopener">' + esc(about.resumeLabel || "下载简历") + ' ↗</a>' : '<p class="footer-note">请填写简历路径。</p>') + '</section>' +
      '<section class="footer-block" id="contact"><p class="eyebrow">GET IN TOUCH</p><h3>联系 / Contact</h3>' +
      (email ? '<a class="text-link" href="mailto:' + esc(email) + '">' + esc(email) + ' ↗</a>' : '<p class="footer-note">在 content.js 填写公开邮箱后，这里会自动出现邮箱入口。</p>') +
      '<p class="footer-note">' + esc(about.contactNote) + '</p>' + (socials ? '<ul class="social-list">' + socials + '</ul>' : "") + '</section>';

    var heroResume = document.querySelector("[data-resume-link]");
    if (heroResume) {
      if (resume) heroResume.href = resume;
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

  function render() {
    var site = data.site || {};
    document.title = [site.nameZh, site.nameEn].filter(Boolean).join(" ") + " — " + text(site.role);
    var meta = document.querySelector('meta[name="description"]');
    if (meta && site.pageDescription) meta.content = site.pageDescription;
    setText("[data-site-name]", [site.nameZh, site.nameEn].filter(Boolean).join(" "));
    setText("[data-name-zh]", site.nameZh);
    setText("[data-name-en]", site.nameEn);
    setText("[data-role]", site.role);
    setText("[data-hero-eyebrow]", site.eyebrow);
    setText("[data-intro-zh]", site.introZh);
    setText("[data-intro-en]", site.introEn);
    setText("[data-project-count]", String(projects.length).padStart(2, "0") + " PROJECTS");
    var fields = document.querySelector("[data-fields]");
    if (fields) fields.innerHTML = (site.fields || []).map(function (field) { return '<span>' + esc(field) + '</span>'; }).join("");
    renderFilters();
    renderGrid();
    renderFooter();
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
