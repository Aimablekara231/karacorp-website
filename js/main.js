document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const revealElements = document.querySelectorAll('.reveal');
const mailtoForms = document.querySelectorAll('[data-mailto-form]');

function updateHeaderState() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
}

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

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

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

mailtoForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const recipient = form.dataset.recipient || 'info@karacorp.org';
    const subject = encodeURIComponent(form.dataset.subject || 'KaraCorp enquiry');
    const formData = new FormData(form);
    const bodyLines = [];

    formData.forEach((value, key) => {
      if (value) {
        const label = key
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
        bodyLines.push(`${label}: ${value}`);
      }
    });

    const body = encodeURIComponent(bodyLines.join('\n'));
    const status = form.querySelector('[data-form-status]');

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

    if (status) {
      status.textContent = 'Your email client should open with this enquiry addressed to info@karacorp.org.';
    }
  });
});
