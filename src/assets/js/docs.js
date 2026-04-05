/* ============================================================
   WELLBELOVE.ORG — Docs Layout JS
   Sidebar toggle, scroll tracking, search, mobile drawer

   Responsive behaviour:
     Desktop  (>1200px)  Sidebar in-flow, no toggle needed
     Medium   (800-1200) Sidebar is overlay drawer with toggle
     Small    (<800px)   Same drawer, toggle at bottom-left
   ============================================================ */

(function () {
  'use strict';

  // ── DOM REFS ──────────────────────────────────────────────
  var sidebar     = document.querySelector('.docs-sidebar');
  var searchInput = document.querySelector('.docs-search-input');
  var navGroups   = document.querySelectorAll('.docs-nav-group');
  var navLinks    = document.querySelectorAll('.docs-nav-items a');

  if (!sidebar) return; // bail if no docs layout on this page

  // ── CREATE TOGGLE BUTTON (injected by JS so HTML stays clean) ──
  var drawerToggle = document.querySelector('.docs-drawer-toggle');
  if (!drawerToggle) {
    drawerToggle = document.createElement('button');
    drawerToggle.className = 'docs-drawer-toggle';
    drawerToggle.setAttribute('aria-label', 'Toggle documentation sidebar');
    drawerToggle.innerHTML =
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="3" y1="6" x2="21" y2="6"/>' +
        '<line x1="3" y1="12" x2="21" y2="12"/>' +
        '<line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>';
    document.body.appendChild(drawerToggle);
  }

  // ── CREATE OVERLAY BACKDROP ────────────────────────────────
  var overlay = document.querySelector('.docs-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'docs-overlay';
    document.body.appendChild(overlay);
  }

  // ── RESPONSIVE STATE ──────────────────────────────────────
  var DESKTOP_MIN = 1201;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  // ── DRAWER OPEN / CLOSE ───────────────────────────────────
  function openDrawer() {
    if (isDesktop()) return;            // sidebar is in-flow on desktop
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function toggleDrawer() {
    if (sidebar.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  // Toggle button click
  drawerToggle.addEventListener('click', toggleDrawer);

  // Overlay backdrop click
  overlay.addEventListener('click', closeDrawer);

  // Escape key closes drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeDrawer();
    }
  });

  // On resize: if we cross into desktop territory, clean up drawer state
  var resizeTick = false;

  window.addEventListener('resize', function () {
    if (resizeTick) return;
    resizeTick = true;
    requestAnimationFrame(function () {
      if (isDesktop()) {
        // Clean up any leftover drawer state on desktop
        closeDrawer();
      }
      resizeTick = false;
    });
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
      .getPropertyValue('--nav-h')
      .trim(),
    10
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

      // Update URL hash without jumping
      history.pushState(null, '', href);

      // Close drawer on link click (medium/small)
      if (!isDesktop()) {
        closeDrawer();
      }
    });
  });

  // ── SCROLL SPY — ACTIVE SECTION TRACKING ──────────────────
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
      var rect = sections[i].el.getBoundingClientRect();
      if (rect.top - offset <= 0) {
        current = sections[i];
      }
    }

    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (current) {
      current.link.classList.add('active');

      // Ensure the active link's parent group is expanded
      var parentGroup = current.link.closest('.docs-nav-group');
      if (parentGroup && parentGroup.classList.contains('collapsed')) {
        parentGroup.classList.remove('collapsed');
      }
    }

    scrollTick = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTick) {
      requestAnimationFrame(updateActiveSection);
      scrollTick = true;
    }
  }, { passive: true });

  // Initial highlight
  updateActiveSection();

  // ── SIDEBAR SEARCH / FILTER ───────────────────────────────
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();

      navGroups.forEach(function (group) {
        var items = group.querySelectorAll('.docs-nav-items li');
        var visibleCount = 0;

        items.forEach(function (li) {
          var a = li.querySelector('a');
          var text = (a ? a.textContent : li.textContent).toLowerCase();
          if (!query || text.indexOf(query) !== -1) {
            li.classList.remove('docs-hidden');
            visibleCount++;
          } else {
            li.classList.add('docs-hidden');
          }
        });

        // Hide entire group if no items match; auto-expand matching groups
        if (query && visibleCount === 0) {
          group.classList.add('docs-hidden');
        } else {
          group.classList.remove('docs-hidden');
          if (query && visibleCount > 0) {
            group.classList.remove('collapsed');
          }
        }
      });
    });
  }

  // ── HANDLE INITIAL HASH ───────────────────────────────────
  if (window.location.hash) {
    var hashTarget = document.getElementById(window.location.hash.substring(1));
    if (hashTarget) {
      setTimeout(function () {
        var top = hashTarget.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 100);
    }
  }

})();
