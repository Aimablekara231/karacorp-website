document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const revealElements = document.querySelectorAll('.reveal');
const mailtoForms = document.querySelectorAll('[data-mailto-form]');
const counters = document.querySelectorAll('[data-count-to]');
const progressBar = document.querySelector('[data-scroll-progress]');
const filterButtons = document.querySelectorAll('[data-filter]');
const filterItems = document.querySelectorAll('[data-filter-tags]');
const backToTop = document.querySelector('[data-back-to-top]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.body.classList.add('is-loading');

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

function updateScrollProgress() {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
}

updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
window.addEventListener('load', () => {
  document.body.classList.remove('is-loading');
  updateScrollProgress();
});

function updateBackToTop() {
  if (!backToTop) return;
  backToTop.classList.toggle('is-visible', window.scrollY > 720);
}

updateBackToTop();
window.addEventListener('scroll', updateBackToTop, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0.12,
    }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

function animateCounter(element) {
  const target = Number(element.dataset.countTo);
  if (!Number.isFinite(target)) return;

  if (reduceMotion) {
    element.textContent = String(target);
    return;
  }

  const duration = target > 100 ? 1200 : 850;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      element.textContent = String(target);
    }
  }

  requestAnimationFrame(frame);
}

if (counters.length) {
  if ('IntersectionObserver' in window) {
    const counterTrigger = document.querySelector('.impact-inner') || counters[0];
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            counters.forEach(animateCounter);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.24 }
    );

    counterObserver.observe(counterTrigger);
  } else {
    counters.forEach(animateCounter);
  }
}

function highlightTargetFromHash(hash) {
  if (!hash || hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  target.classList.remove('anchor-highlight');
  void target.offsetWidth;
  target.classList.add('anchor-highlight');
}

document.querySelectorAll('a[href*="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const url = new URL(link.href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) {
      setTimeout(() => highlightTargetFromHash(url.hash), 550);
    }
  });
});

window.addEventListener('hashchange', () => highlightTargetFromHash(window.location.hash));
window.addEventListener('load', () => highlightTargetFromHash(window.location.hash));

if (filterButtons.length && filterItems.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      filterItems.forEach((item) => {
        const tags = (item.dataset.filterTags || '').split(' ');
        const shouldShow = filter === 'all' || tags.includes(filter);
        item.classList.toggle('is-filter-hidden', !shouldShow);
      });
    });
  });
}

mailtoForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const recipient = form.dataset.recipient || 'info@karacorp.org';
    const subject = encodeURIComponent(form.dataset.subject || 'KaraCorp enquiry');
    const endpoint = form.dataset.endpoint;
    const formData = new FormData(form);
    const bodyLines = [];
    const payload = {};

    formData.forEach((value, key) => {
      if (value) {
        payload[key] = value;
        const label = key
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
        bodyLines.push(`${label}: ${value}`);
      }
    });

    const body = encodeURIComponent(bodyLines.join('\n'));
    const status = form.querySelector('[data-form-status]');

    if (status) {
      status.classList.remove('is-success', 'is-error');
      status.textContent = 'Submitting your enquiry...';
    }

    if (endpoint) {
      try {
        payload.source = window.location.href;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'Submission failed');
        }
        form.reset();
        if (status) {
          status.classList.add('is-success');
          status.textContent = result.message || 'Thank you. Your enquiry has been received.';
        }
        return;
      } catch (error) {
        if (status) {
          status.classList.add('is-error');
          status.textContent = 'Online submission is unavailable. Opening your email client instead.';
        }
      }
    }

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
});
