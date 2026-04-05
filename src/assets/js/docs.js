/* ============================================================
   WELLBELOVE.ORG — Docs Layout JS

   Desktop/tablet: sidebar always visible, collapse arrow
   Mobile (<800px): sidebar as overlay drawer with FAB toggle
   Auto-generates sidebar nav from content headings if empty
   ============================================================ */

(function () {
  'use strict';

  var sidebar     = document.querySelector('.docs-sidebar');
  var layout      = document.querySelector('.docs-layout');
  var searchInput = document.querySelector('.docs-search-input');
  var content     = document.querySelector('.docs-content');

  if (!sidebar || !layout) return;

  // ── AUTO-GENERATE SIDEBAR NAV FROM HEADINGS ───────────────
  var autoNav = document.getElementById('docs-auto-nav');
  if (autoNav && autoNav.children.length === 0 && content) {
    var headings = content.querySelectorAll('h2[id], h3[id]');
    var html = '';
    var inGroup = false;

    headings.forEach(function (h) {
      if (h.tagName === 'H2') {
        // Close previous group if open
        if (inGroup) html += '</ul></div>';
        // Start new group — h2 becomes a standalone link
        html += '<div class="docs-nav-group"><ul class="docs-nav-items">';
        html += '<li><a href="#' + h.id + '">' + h.textContent.trim() + '</a></li>';
        inGroup = true;
      } else if (h.tagName === 'H3' && inGroup) {
        html += '<li><a href="#' + h.id + '">' + h.textContent.trim() + '</a></li>';
      }
    });

    if (inGroup) html += '</ul></div>';
    autoNav.innerHTML = html;
  }

  // Re-query after auto-generation
  var navGroups = document.querySelectorAll('.docs-nav-group');
  var navLinks  = document.querySelectorAll('.docs-nav-items a');

  var MOBILE_MAX = 799;

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX;
  }

  // ── COLLAPSE BUTTON (inside search bar) ────────────────────
  var collapseToggle = document.createElement('button');
  collapseToggle.className = 'docs-collapse-toggle';
  collapseToggle.setAttribute('aria-label', 'Collapse sidebar');
  collapseToggle.innerHTML =
    '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="15 18 9 12 15 6"/>' +
    '</svg>';
  var searchArea = document.querySelector('.docs-search');
  if (searchArea) {
    searchArea.appendChild(collapseToggle);
  }

  // ── REOPEN BUTTON (visible when collapsed) ────────────────
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

  // ── HAMBURGER FAB (mobile) ────────────────────────────────
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

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileDrawer();
  });

  window.addEventListener('resize', function () {
    if (!isMobile()) closeMobileDrawer();
  }, { passive: true });

  // ── SECTION COLLAPSE / EXPAND ─────────────────────────────
  navGroups.forEach(function (group) {
    var heading = group.querySelector('.docs-nav-heading');
    if (!heading) return;
    heading.addEventListener('click', function () {
      group.classList.toggle('collapsed');
    });
  });

  // ── SMOOTH SCROLL ON LINK CLICK ───────────────────────────
  var navH = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h').trim(), 10
  ) || 64;

  navLinks.forEach(function (link) {
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

  // ── SCROLL SPY ────────────────────────────────────────────
  var sections = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var el = document.getElementById(href.substring(1));
    if (el) sections.push({ el: el, link: link });
  });

  var scrollTick = false;

  function updateActiveSection() {
    var offset = navH + 40;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.getBoundingClientRect().top - offset <= 0) {
        current = sections[i];
      }
    }
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (current) {
      current.link.classList.add('active');
      var pg = current.link.closest('.docs-nav-group');
      if (pg && pg.classList.contains('collapsed')) pg.classList.remove('collapsed');
    }
    scrollTick = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTick) { requestAnimationFrame(updateActiveSection); scrollTick = true; }
  }, { passive: true });

  updateActiveSection();

  // ── SIDEBAR SEARCH / FILTER ───────────────────────────────
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      navGroups.forEach(function (group) {
        var items = group.querySelectorAll('.docs-nav-items li');
        var vis = 0;
        items.forEach(function (li) {
          var a = li.querySelector('a');
          var text = (a ? a.textContent : li.textContent).toLowerCase();
          if (!query || text.indexOf(query) !== -1) { li.classList.remove('docs-hidden'); vis++; }
          else { li.classList.add('docs-hidden'); }
        });
        if (query && vis === 0) group.classList.add('docs-hidden');
        else { group.classList.remove('docs-hidden'); if (query && vis > 0) group.classList.remove('collapsed'); }
      });
    });
  }

  // ── HANDLE INITIAL HASH ───────────────────────────────────
  if (window.location.hash) {
    var ht = document.getElementById(window.location.hash.substring(1));
    if (ht) {
      setTimeout(function () {
        window.scrollTo({ top: ht.getBoundingClientRect().top + window.pageYOffset - navH - 16, behavior: 'smooth' });
      }, 100);
    }
  }

})();
