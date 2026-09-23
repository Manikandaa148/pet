/**
 * ============================================================
 * PawPrint Pet Shop — Main JavaScript
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
   *  1. APPLY CONFIG TO DOM
   * ────────────────────────────────────────────────────────── */
  if (typeof SHOP_CONFIG === 'undefined') {
    console.warn('SHOP_CONFIG not loaded. Check js/config.js');
    return;
  }

  const cfg = SHOP_CONFIG;

  // Helper: build WhatsApp URL
  const waURL = (msg) =>
    `https://wa.me/${cfg.WHATSAPP_RAW}?text=${encodeURIComponent(msg)}`;

  const telURL = () => `tel:${cfg.PHONE_RAW}`;

  // Populate all [data-config] elements
  document.querySelectorAll('[data-config]').forEach(el => {
    const key = el.getAttribute('data-config');
    if (cfg[key] !== undefined) {
      if (el.tagName === 'A') {
        if (key === 'PHONE_LINK') el.href = telURL();
        else if (key === 'WA_LINK') el.href = waURL(cfg.WA_GENERAL);
        else el.textContent = cfg[key];
      } else {
        el.textContent = cfg[key];
      }
    }
  });

  // WhatsApp buttons
  document.querySelectorAll('[data-wa]').forEach(btn => {
    const msgKey = btn.getAttribute('data-wa');
    const msg = cfg[msgKey] || cfg.WA_GENERAL;
    btn.href = waURL(msg);
    btn.setAttribute('rel', 'noopener noreferrer');
    btn.setAttribute('target', '_blank');
  });

  // Phone buttons
  document.querySelectorAll('[data-tel]').forEach(btn => {
    btn.href = telURL();
  });

  // Google Maps buttons
  document.querySelectorAll('[data-maps]').forEach(btn => {
    btn.href = cfg.GOOGLE_MAPS_URL;
    btn.setAttribute('rel', 'noopener noreferrer');
    btn.setAttribute('target', '_blank');
  });

  // Social links
  const socials = { instagram: 'INSTAGRAM_URL', facebook: 'FACEBOOK_URL', google: 'GOOGLE_BIZ_URL' };
  Object.entries(socials).forEach(([name, key]) => {
    document.querySelectorAll(`[data-social="${name}"]`).forEach(el => {
      el.href = cfg[key] || '#';
    });
  });

  // Inject JSON-LD structured data
  injectStructuredData(cfg, waURL);


  /* ──────────────────────────────────────────────────────────
   *  2. NAVIGATION
   * ────────────────────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');

  // Sticky shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    navMobile.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMobile.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMobile.classList.contains('open')) {
      hamburger.classList.remove('active');
      navMobile.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active nav highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${current}`
      );
    });
  }, { passive: true });


  /* ──────────────────────────────────────────────────────────
   *  3. SCROLL ANIMATIONS (IntersectionObserver)
   * ────────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('.fade-in').forEach(el => {
      el.classList.add('visible');
    });
  }


  /* ──────────────────────────────────────────────────────────
   *  4. CONTACT FORM
   * ────────────────────────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm(form)) return;

      const name    = form.querySelector('#name').value.trim();
      const phone   = form.querySelector('#phone').value.trim();
      const pet     = form.querySelector('#pet')?.value || '';
      const message = form.querySelector('#message').value.trim();

      const petText = pet && pet !== 'none' ? ` I have a ${pet}.` : '';
      const waMsg   = `Hi! I'm ${name} (${phone}).${petText} ${message}`;

      // Open WhatsApp with the form data
      window.open(waURL(waMsg), '_blank', 'noopener,noreferrer');

      // Show success message
      showFormSuccess(form);
    });
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    const phoneField = form.querySelector('#phone');
    if (phoneField && phoneField.value.trim()) {
      const phoneClean = phoneField.value.replace(/\s/g, '');
      if (!/^[+]?[\d]{7,15}$/.test(phoneClean)) {
        phoneField.classList.add('error');
        valid = false;
      }
    }

    if (!valid) {
      form.querySelector('.error')?.focus();
    }
    return valid;
  }

  function showFormSuccess(form) {
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '✓ Opening WhatsApp…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
    }, 3000);
  }


  /* ──────────────────────────────────────────────────────────
   *  5. SMOOTH SCROLL FOR ANCHOR LINKS
   * ────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ──────────────────────────────────────────────────────────
   *  6. JSON-LD STRUCTURED DATA
   * ────────────────────────────────────────────────────────── */
  function injectStructuredData(cfg) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "PetStore",
      "name": cfg.SHOP_NAME,
      "description": cfg.DESCRIPTION,
      "telephone": cfg.PHONE,
      "email": cfg.EMAIL || undefined,
      "url": cfg.CANONICAL_URL,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": `${cfg.ADDRESS_LINE1}, ${cfg.ADDRESS_LINE2}`,
        "addressLocality": cfg.SCHEMA_CITY,
        "addressRegion": cfg.SCHEMA_REGION,
        "postalCode": cfg.SCHEMA_POSTAL,
        "addressCountry": cfg.SCHEMA_COUNTRY
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
          "opens": "09:00",
          "closes": "20:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Sunday"],
          "opens": "10:00",
          "closes": "18:00"
        }
      ],
      "hasMap": cfg.GOOGLE_MAPS_URL,
      "sameAs": [
        cfg.INSTAGRAM_URL !== '#' ? cfg.INSTAGRAM_URL : null,
        cfg.FACEBOOK_URL !== '#' ? cfg.FACEBOOK_URL : null,
      ].filter(Boolean)
    };

    if (cfg.SCHEMA_LAT && cfg.SCHEMA_LON) {
      schema.geo = {
        "@type": "GeoCoordinates",
        "latitude": cfg.SCHEMA_LAT,
        "longitude": cfg.SCHEMA_LON
      };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /* ──────────────────────────────────────────────────────────
   *  7. FORM FIELD ERROR STYLING (reset on input)
   * ────────────────────────────────────────────────────────── */
  document.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });

});
