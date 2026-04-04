/* ============================================================
   WELLBELOVE.ORG — Docs Layout JS
   Sidebar toggle, scroll tracking, search, mobile drawer
   ============================================================ */

(function () {
  'use strict';

  // ── DOM REFS ──────────────────────────────────────────────
  const sidebar      = document.querySelector('.docs-sidebar');
  const overlay      = document.querySelector('.docs-overlay');
  const drawerToggle = document.querySelector('.docs-drawer-toggle');
  const searchInput  = document.querySelector('.docs-search-input');
  const navGroups    = document.querySelectorAll('.docs-nav-group');
  const navLinks     = document.querySelectorAll('.docs-nav-items a');

  if (!sidebar) return; // bail if no docs layout on this page

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

      // Close mobile drawer if open
      closeMobileDrawer();
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
    var scrollY = window.pageYOffset;
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
          var link = li.querySelector('a');
          var text = (link ? link.textContent : li.textContent).toLowerCase();
          if (!query || text.indexOf(query) !== -1) {
            li.classList.remove('docs-hidden');
            visibleCount++;
          } else {
            li.classList.add('docs-hidden');
          }
        });

        // Hide entire group if no items match; also auto-expand matching groups
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

  // ── MOBILE DRAWER ─────────────────────────────────────────
  function openMobileDrawer() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (drawerToggle) {
    drawerToggle.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileDrawer);
  }

  // Close drawer on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeMobileDrawer();
    }
  });

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
