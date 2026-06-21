/* ============================
   VOIDTOSOLVED — MAIN JS
   ============================ */

// ── Theme Toggle ──
const themeToggle = document.querySelectorAll('.theme-toggle');
const savedTheme = localStorage.getItem('vts-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon();

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeToggle.forEach(btn => {
    btn.innerHTML = isDark
      ? '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
      : '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

themeToggle.forEach(btn => {
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('vts-theme', next);
    updateThemeIcon();
  });
});

// ── Mobile Nav ──
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    hamburger.classList.toggle('active', open);
  });

  // close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
}

// ── Scroll Animations ──
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  fadeEls.forEach(el => observer.observe(el));
}

// ── Active Nav Link ──
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (
    href === currentPage ||
    (currentPage === '' && href === 'index.html') ||
    (href === 'index.html' && (currentPage === '' || currentPage === '/'))
  ) {
    link.classList.add('active');
  }
});

// ── Smooth Scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Nav scroll effect ──
const navEl = document.querySelector('nav');
if (navEl) {
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Contact Form (Formspree) ──
const contactForms = document.querySelectorAll('.contact-form');
contactForms.forEach(form => {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const successEl = form.closest('.form-card')?.querySelector('.form-success');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const data = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      } else {
        btn.disabled = false;
        btn.textContent = originalText;
        alert('Something went wrong. Please try again or email us directly.');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = originalText;
      alert('Network error. Please check your connection and try again.');
    }
  });
});

// ── Hamburger animation styles ──
const style = document.createElement('style');
style.textContent = `
  nav.scrolled { box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
  .hamburger.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.active span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
`;
document.head.appendChild(style);

// ============================
// INTERACTIVE ENHANCEMENTS
// ============================
(function () {
  const isTouch = window.matchMedia('(hover: none)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Scroll Progress Bar ──
  if (!reducedMotion) {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.insertBefore(bar, document.body.firstChild);
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }, { passive: true });
  }

  // ── Custom Cursor (desktop only) ──
  if (!isTouch && !reducedMotion) {
    const ring = document.createElement('div');
    ring.className = 'cursor-glow';
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    let rx = -200, ry = -200, tx = -200, ty = -200;

    document.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.left = tx + 'px';
      dot.style.top = ty + 'px';
      ring.style.opacity = dot.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
      ring.style.opacity = dot.style.opacity = '0';
    });

    (function lerpRing() {
      rx += (tx - rx) * 0.1;
      ry += (ty - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(lerpRing);
    })();

    document.querySelectorAll('a, button, .card, .service-card, .project-card, .lang-pill').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
    });
  }

  // ── Hero Particle Field ──
  const hero = document.querySelector('.hero');
  if (hero && !reducedMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    hero.insertBefore(canvas, hero.firstChild);
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = isTouch ? 25 : 52;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.2 + 0.4,
      a: Math.random() * 0.4 + 0.08,
    }));

    let mx = -9999, my = -9999;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

    (function tick() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p, i) => {
        const dx = mx - p.x, dy = my - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 180 && d > 0) {
          p.vx += (dx / d) * 0.016;
          p.vy += (dy / d) * 0.016;
        }
        const spd = Math.hypot(p.vx, p.vy);
        if (spd > 1.1) { p.vx = (p.vx / spd) * 1.1; p.vy = (p.vy / spd) * 1.1; }
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26,107,255,${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(26,107,255,${(1 - dist / 125) * 0.13})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(tick);
    })();
  }

  // ── Orb Mouse Parallax ──
  const orbScene = document.querySelector('.orb-scene');
  if (orbScene && hero && !isTouch && !reducedMotion) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      orbScene.style.transform = `translate(${x * 24}px, ${y * 14}px)`;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { orbScene.style.transform = ''; });
  }

  // ── 3D Card Tilt ──
  if (!isTouch && !reducedMotion) {
    document.querySelectorAll('.card, .service-card, .project-card, .team-card').forEach(card => {
      const lift = card.classList.contains('card') ? '-4px' : '-6px';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(${lift}) perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 6}deg)`;
        card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  } else {
    document.querySelectorAll('.card, .service-card, .project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ── Magnetic Buttons ──
  if (!isTouch && !reducedMotion) {
    document.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
        btn.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
        btn.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ── Count-up Animation ──
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const dur = 1600;
      (function update(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(update);
      })(t0);
    }, { threshold: 0.5 });
    obs.observe(el);
  });

})();
