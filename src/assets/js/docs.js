/* ============================================================
   WELLBELOVE.ORG — Docs Layout JS

   - Populates current page's h2 sections into sidebar
   - Global search (page titles + current page headings)
   - Collapsible genre groups, sidebar collapse
   - Cmd/Ctrl+K focuses search
   - Copy-link on heading hover
   - Copy-to-clipboard on code blocks
   - Mobile drawer
   ============================================================ */

(function () {
  'use strict';

  var sidebar     = document.querySelector('.docs-sidebar');
  var layout      = document.querySelector('.docs-layout');
  var searchInput = document.querySelector('.docs-search-input');
  var content     = document.querySelector('.docs-content');
  var navRoot     = document.getElementById('docs-nav');

  if (!sidebar || !layout || !navRoot) return;

  var MOBILE_MAX = 799;
  function isMobile() { return window.innerWidth <= MOBILE_MAX; }

  // ── POPULATE CURRENT PAGE'S H2 SECTIONS ─────────────────────
  var sectionsContainer = document.getElementById('docs-nav-sections');
  if (sectionsContainer && content) {
    var headings = content.querySelectorAll('h2[id]');
    var html = '';
    headings.forEach(function (h) {
      html += '<li><a href="#' + h.id + '" data-title="' + h.textContent.trim() + '">' + h.textContent.trim() + '</a></li>';
    });
    sectionsContainer.innerHTML = html;
  }

  // Re-query everything after section population
  var navGroups   = navRoot.querySelectorAll('.docs-nav-group');
  var navHeadings = navRoot.querySelectorAll('.docs-nav-heading');
  var pageLinks   = navRoot.querySelectorAll('.docs-nav-page');
  var sectionLinks= navRoot.querySelectorAll('.docs-nav-sections a');

  // ── GENRE GROUP COLLAPSE / EXPAND ───────────────────────────
  navHeadings.forEach(function (heading) {
    heading.addEventListener('click', function () {
      var group = heading.closest('.docs-nav-group');
      if (!group) return;
      var collapsed = group.classList.toggle('collapsed');
      heading.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    });
  });

  // ── SIDEBAR COLLAPSE BUTTON (inside search bar) ─────────────
  var collapseToggle = document.createElement('button');
  collapseToggle.className = 'docs-collapse-toggle';
  collapseToggle.setAttribute('aria-label', 'Collapse sidebar');
  collapseToggle.innerHTML =
    '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="15 18 9 12 15 6"/>' +
    '</svg>';
  var searchArea = document.querySelector('.docs-search');
  if (searchArea) searchArea.appendChild(collapseToggle);

  var reopenToggle = document.createElement('button');
  reopenToggle.className = 'docs-reopen-toggle';
  reopenToggle.setAttribute('aria-label', 'Open sidebar');
  reopenToggle.innerHTML =
    '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="9 18 15 12 9 6"/>' +
    '</svg>';
  layout.appendChild(reopenToggle);

  function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    layout.classList.toggle('sidebar-collapsed');
  }

  collapseToggle.addEventListener('click', toggleSidebar);
  reopenToggle.addEventListener('click', toggleSidebar);

  // ── MOBILE DRAWER ───────────────────────────────────────────
  var drawerToggle = document.createElement('button');
  drawerToggle.className = 'docs-drawer-toggle';
  drawerToggle.setAttribute('aria-label', 'Toggle documentation sidebar');
  drawerToggle.innerHTML =
    '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="3" y1="6" x2="21" y2="6"/>' +
      '<line x1="3" y1="12" x2="21" y2="12"/>' +
      '<line x1="3" y1="18" x2="21" y2="18"/>' +
    '</svg>';
  document.body.appendChild(drawerToggle);

  var overlay = document.createElement('div');
  overlay.className = 'docs-overlay';
  document.body.appendChild(overlay);

  function openMobileDrawer() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileDrawer() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  drawerToggle.addEventListener('click', function () {
    sidebar.classList.contains('open') ? closeMobileDrawer() : openMobileDrawer();
  });
  overlay.addEventListener('click', closeMobileDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobileDrawer(); });
  window.addEventListener('resize', function () {
    if (!isMobile()) closeMobileDrawer();
  }, { passive: true });

  // ── SMOOTH SCROLL ON SECTION-LINK CLICK ─────────────────────
  var navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim(), 10
  ) || 64;

  sectionLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.getElementById(href.substring(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.pushState(null, '', href);
      if (isMobile()) closeMobileDrawer();
    });
  });

  // ── SCROLL SPY (highlights current h2 in sidebar) ──────────
  var sections = [];
  sectionLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var el = document.getElementById(href.substring(1));
    if (el) sections.push({ el: el, link: link });
  });

  var scrollTick = false;
  function updateActiveSection() {
    scrollTick = false;
    if (!sections.length) return;

    var offset = navH + 40;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var viewportH = window.innerHeight;
    var pageH = document.documentElement.scrollHeight;
    var activeIdx = -1;

    // If scrolled to within 40px of the bottom, always pick the last section
    if (scrollY + viewportH >= pageH - 40) {
      activeIdx = sections.length - 1;
    } else {
      // Find the last section whose top has passed the offset line
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.getBoundingClientRect().top - offset <= 0) activeIdx = i;
      }
      // If no section has passed yet, default to the first
      if (activeIdx < 0 && sections[0].el.getBoundingClientRect().top > offset) activeIdx = 0;
    }

    sectionLinks.forEach(function (l) { l.classList.remove('active'); });
    if (activeIdx >= 0 && sections[activeIdx]) {
      sections[activeIdx].link.classList.add('active');
    }

    // Auto-scroll the sidebar to keep the active link in view
    if (activeIdx >= 0 && sections[activeIdx]) {
      var activeLink = sections[activeIdx].link;
      var sidebarRect = sidebar.getBoundingClientRect();
      var linkRect = activeLink.getBoundingClientRect();
      if (linkRect.top < sidebarRect.top + 60 || linkRect.bottom > sidebarRect.bottom - 20) {
        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }
  window.addEventListener('scroll', function () {
    if (!scrollTick) { requestAnimationFrame(updateActiveSection); scrollTick = true; }
  }, { passive: true });
  window.addEventListener('resize', function () {
    if (!scrollTick) { requestAnimationFrame(updateActiveSection); scrollTick = true; }
  }, { passive: true });
  updateActiveSection();

  // ── SEARCH (across page titles + current page sections) ────
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      navGroups.forEach(function (group) {
        var anyVisible = false;
        var pageWraps = group.querySelectorAll('.docs-nav-page-wrap');
        pageWraps.forEach(function (wrap) {
          var pageLink = wrap.querySelector('.docs-nav-page');
          var pageTitle = (pageLink.getAttribute('data-title') || pageLink.textContent).toLowerCase();
          var secLinks = wrap.querySelectorAll('.docs-nav-sections a');
          var pageMatch = !q || pageTitle.indexOf(q) !== -1;
          var anySecMatch = false;
          secLinks.forEach(function (sl) {
            var st = (sl.getAttribute('data-title') || sl.textContent).toLowerCase();
            var match = !q || st.indexOf(q) !== -1 || pageMatch;
            sl.parentElement.classList.toggle('docs-hidden', !match);
            if (match && q) anySecMatch = true;
          });
          var show = pageMatch || anySecMatch || !q;
          wrap.classList.toggle('docs-hidden', !show);
          if (show) anyVisible = true;
        });
        group.classList.toggle('docs-hidden', !anyVisible);
      });
    });

    // Cmd/Ctrl+K focuses search
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // ── ANCHOR LINK-ON-HOVER FOR CONTENT HEADINGS ──────────────
  if (content) {
    var contentHeadings = content.querySelectorAll('h2[id], h3[id]');
    contentHeadings.forEach(function (h) {
      var link = document.createElement('a');
      link.className = 'docs-heading-anchor';
      link.href = '#' + h.id;
      link.setAttribute('aria-label', 'Copy link to this section');
      link.innerHTML = '#';
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var url = window.location.origin + window.location.pathname + '#' + h.id;
        history.pushState(null, '', '#' + h.id);
        // Smooth scroll
        var top = h.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            link.classList.add('copied');
            setTimeout(function () { link.classList.remove('copied'); }, 1500);
          }).catch(function () {});
        }
      });
      h.appendChild(link);
    });
  }

  // ── COPY-TO-CLIPBOARD ON CODE BLOCKS ───────────────────────
  if (content) {
    var codeBlocks = content.querySelectorAll('pre > code');
    codeBlocks.forEach(function (code) {
      var pre = code.parentElement;
      pre.style.position = 'relative';
      var btn = document.createElement('button');
      btn.className = 'docs-copy-code';
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.innerHTML = 'Copy';
      btn.addEventListener('click', function () {
        var text = code.textContent;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.innerHTML = 'Copied';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.innerHTML = 'Copy';
              btn.classList.remove('copied');
            }, 1500);
          }).catch(function () {});
        }
      });
      pre.appendChild(btn);
    });
  }

  // ── HANDLE INITIAL HASH ────────────────────────────────────
  if (window.location.hash) {
    var ht = document.getElementById(window.location.hash.substring(1));
    if (ht) {
      setTimeout(function () {
        window.scrollTo({
          top: ht.getBoundingClientRect().top + window.pageYOffset - navH - 16,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

})();
