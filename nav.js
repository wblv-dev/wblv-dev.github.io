/* ============================================================
   WELLBELOVE.ORG — Shared Navigation JS
   ============================================================ */

(function() {

  // ── ACTIVE NAV STATE ──────────────────────────────────────
  // Mark the current page's nav link as active
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    // Exact match or starts-with for section pages
    if (href === path ||
        (href !== '/' && href !== '/index.html' && path.startsWith(href.replace('index.html', '')))) {
      link.classList.add('active');
    }
    // Home
    if ((path === '/' || path === '/index.html') && (href === '/' || href === '/index.html')) {
      link.classList.add('active');
    }
  });

  // ── MOBILE MENU ───────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      // Animate hamburger to X
      const spans = toggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });
  }

})();
