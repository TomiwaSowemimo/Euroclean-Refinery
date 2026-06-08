// Hero Slider
const heroSlider = (() => {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const container = document.querySelector('.hero-slides-container');
  let currentSlide = 0;
  let autoplayInterval = null;
  const AUTOPLAY_DELAY = 7000;

  const resetAnimations = (slide) => {
    if (!slide) return;
    const title = slide.querySelector('.hero-title');
    const subtitle = slide.querySelector('.hero-subtitle');
    const buttons = slide.querySelectorAll('.hero-btn');

    // Force reflow by toggling inline animation so CSS animations restart
    [title, subtitle, ...buttons].forEach((el) => {
      if (!el) return;
      el.style.animation = 'none';
      // small timeout to allow browser to drop the style and reapply CSS animation
      setTimeout(() => {
        el.style.animation = '';
      }, 20);
    });
  };

  const showSlide = (index) => {
    const safeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === safeIndex;
      slide.classList.toggle('active', active);
      if (active) resetAnimations(slide);
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === safeIndex));
    currentSlide = safeIndex;
  };

  const prevSlide = () => showSlide(currentSlide - 1);
  const nextSlide = () => showSlide(currentSlide + 1);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
  };

  const stopAutoplay = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  // Touch / swipe support
  const setupTouch = () => {
    if (!container) return;
    let startX = 0;
    let currentX = 0;
    const THRESHOLD = 50; // px

    container.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        startX = e.touches[0].clientX;
        currentX = startX;
        stopAutoplay();
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 1) {
        currentX = e.touches[0].clientX;
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      const delta = currentX - startX;
      if (Math.abs(delta) > THRESHOLD) {
        if (delta > 0) prevSlide(); else nextSlide();
      }
      resetAutoplay();
    });

    // Pointer fallback for mouse drag
    let pointerDown = false;
    container.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      startX = e.clientX;
      currentX = startX;
      stopAutoplay();
    });

    container.addEventListener('pointermove', (e) => {
      if (!pointerDown) return;
      currentX = e.clientX;
    });

    container.addEventListener('pointerup', () => {
      pointerDown = false;
      const delta = currentX - startX;
      if (Math.abs(delta) > THRESHOLD) {
        if (delta > 0) prevSlide(); else nextSlide();
      }
      resetAutoplay();
    });
  };

  const setupKeyboard = () => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
      }
    });
  };

  // Pause on hover (desktop)
  const setupHoverPause = () => {
    if (!container) return;
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', () => {
      resetAutoplay();
    });
  };

  // Initialize
  if (slides.length > 0 && dots.length > 0) {
    showSlide(0);
    startAutoplay();

    // Add click handlers to dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        resetAutoplay();
      });
    });

    setupTouch();
    setupKeyboard();
    setupHoverPause();
  }

  return { showSlide, nextSlide };
})();

const navbar = document.querySelector('.navbar');
const navLinks = document.querySelector('.nav-links');
const menuToggle = document.querySelector('.menu-toggle');

if (navbar && navLinks && menuToggle) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('scroll', onScroll);
  onScroll();
}

const statsSection = document.getElementById('stats');
const statNumbers = document.querySelectorAll('.stat-number');

if (statsSection && statNumbers.length) {
  const statsConfig = [
    { target: 864, decimals: 0, suffix: '' },
    { target: 2.5, decimals: 1, suffix: 'M' },
    { target: 6, decimals: 0, suffix: '+' },
    { target: 80, decimals: 0, suffix: '%' }
  ];

  const formatValue = (config, value) => {
    if (config.decimals > 0) {
      return value.toFixed(config.decimals);
    }
    return Math.round(value).toString();
  };

  const animateValue = (element, config) => {
    const valueSpan = element.querySelector('.stat-value') || element;
    const suffixSpan = element.querySelector('.stat-suffix') || null;

    const duration = 2500;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = Math.min(now - start, duration);
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = config.target * eased;

      const display = (config.decimals > 0) ? currentValue.toFixed(config.decimals) : Math.round(currentValue).toString();

      if (valueSpan) valueSpan.textContent = display;
      if (suffixSpan) suffixSpan.textContent = config.suffix;

      if (elapsed < duration) {
        window.requestAnimationFrame(tick);
      } else {
        const final = (config.decimals > 0) ? config.target.toFixed(config.decimals) : Math.round(config.target).toString();
        if (valueSpan) valueSpan.textContent = final;
        if (suffixSpan) suffixSpan.textContent = config.suffix;
      }
    };

    if (valueSpan) valueSpan.textContent = '0';
    if (suffixSpan) suffixSpan.textContent = '';
    window.requestAnimationFrame(tick);
  };

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!hasAnimated && entry.isIntersecting) {
        statNumbers.forEach((element, index) => {
          window.setTimeout(() => {
            animateValue(element, statsConfig[index]);
          }, index * 300);
        });

        hasAnimated = true;
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  });

  if (typeof IntersectionObserver !== 'undefined') {
    observer.observe(statsSection);
  } else {
    statNumbers.forEach((element, index) => {
      window.setTimeout(() => {
        animateValue(element, statsConfig[index]);
      }, index * 300);
    });
  }
}

const scrollReveal = (() => {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    revealElements.forEach((el) => el.classList.add('revealed'));
    return;
  }

  // Create a dedicated observer per element so each card animates when
  // that specific element reaches 30% visibility.
  revealElements.forEach((element) => {
    const elObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40% 0px' });

    elObserver.observe(element);
  });
})();
