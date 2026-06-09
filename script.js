document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');
  const revealElements = document.querySelectorAll('.reveal');
  const statsSection = document.getElementById('stats');
  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroDots = Array.from(document.querySelectorAll('.hero-dot'));
  const heroPrev = document.querySelector('.hero-arrow-prev');
  const heroNext = document.querySelector('.hero-arrow-next');
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeMenu = () => {
    if (!navLinks || !menuToggle) {
      return;
    }

    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const updateNavbarState = () => {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', updateNavbarState, { passive: true });
  updateNavbarState();

  document.querySelectorAll('.navbar a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetSelector = link.getAttribute('href');

      if (!targetSelector || targetSelector === '#') {
        return;
      }

      const target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }

      event.preventDefault();

      const offset = navbar ? navbar.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth'
      });

      closeMenu();
    });
  });

  if (revealElements.length) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15
      });

      revealElements.forEach((element) => revealObserver.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add('revealed'));
    }
  }

  if (statsSection) {
    const statCards = Array.from(statsSection.querySelectorAll('.stat-card'));

    if (statCards.length) {
      const statConfigs = [
        { value: 864, decimals: 0, suffix: '' },
        { value: 2.5, decimals: 1, suffix: 'M' },
        { value: 6, decimals: 0, suffix: '+' },
        { value: 80, decimals: 0, suffix: '%' }
      ];

      const formatStatValue = (config, currentValue) => {
        if (config.decimals > 0) {
          return currentValue.toFixed(config.decimals);
        }

        return Math.round(currentValue).toString();
      };

      const animateCounter = (card, config) => {
        const valueNode = card.querySelector('.stat-value');
        const suffixNode = card.querySelector('.stat-suffix');

        if (!valueNode) {
          return;
        }

        const duration = 2500;
        const startTime = performance.now();

        valueNode.textContent = '0';

        if (suffixNode) {
          suffixNode.textContent = '';
        }

        const tick = (now) => {
          const elapsed = Math.min(now - startTime, duration);
          const progress = elapsed / duration;
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentValue = config.value * eased;

          valueNode.textContent = formatStatValue(config, currentValue);

          if (elapsed < duration) {
            window.requestAnimationFrame(tick);
          } else {
            valueNode.textContent = formatStatValue(config, config.value);

            if (suffixNode) {
              suffixNode.textContent = config.suffix;
            }
          }
        };

        if (config.suffix && suffixNode) {
          suffixNode.textContent = config.suffix;
        }

        window.requestAnimationFrame(tick);
      };

      let countersStarted = false;

      const startCounters = () => {
        if (countersStarted) {
          return;
        }

        countersStarted = true;

        statCards.slice(0, statConfigs.length).forEach((card, index) => {
          window.setTimeout(() => {
            animateCounter(card, statConfigs[index]);
          }, index * 300);
        });
      };

      if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounters();
              observer.disconnect();
            }
          });
        }, {
          threshold: 0.15
        });

        statsObserver.observe(statsSection);
      } else {
        startCounters();
      }
    }
  }

  if (heroSlides.length) {
    let currentSlide = 0;
    let autoplayTimer = null;

    const showSlide = (index) => {
      const slideCount = heroSlides.length;
      currentSlide = (index + slideCount) % slideCount;

      heroSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === currentSlide);
      });

      heroDots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === currentSlide);
      });
    };

    const nextSlide = () => {
      showSlide(currentSlide + 1);
    };

    const previousSlide = () => {
      showSlide(currentSlide - 1);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = window.setInterval(nextSlide, 7000);
    };

    showSlide(0);

    if (!prefersReducedMotion) {
      startAutoplay();
    }

    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);

        if (!prefersReducedMotion) {
          startAutoplay();
        }
      });
    });

    if (heroPrev) {
      heroPrev.addEventListener('click', () => {
        previousSlide();

        if (!prefersReducedMotion) {
          startAutoplay();
        }
      });
    }

    if (heroNext) {
      heroNext.addEventListener('click', () => {
        nextSlide();

        if (!prefersReducedMotion) {
          startAutoplay();
        }
      });
    }
  }

  const closeFaqItem = (item) => {
    const answer = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');

    if (!answer || !question || !item.classList.contains('is-open')) {
      return;
    }

    answer.style.maxHeight = `${answer.scrollHeight}px`;
    answer.offsetHeight;
    answer.style.maxHeight = '0px';
    item.classList.remove('is-open');
    question.setAttribute('aria-expanded', 'false');

    const onTransitionEnd = (event) => {
      if (event.propertyName !== 'max-height') {
        return;
      }

      answer.hidden = true;
      answer.removeEventListener('transitionend', onTransitionEnd);
    };

    answer.addEventListener('transitionend', onTransitionEnd);
  };

  const openFaqItem = (item) => {
    const answer = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');

    if (!answer || !question || item.classList.contains('is-open')) {
      return;
    }

    answer.hidden = false;
    item.classList.add('is-open');
    question.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = '0px';

    window.requestAnimationFrame(() => {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    });

    const onTransitionEnd = (event) => {
      if (event.propertyName !== 'max-height') {
        return;
      }

      if (item.classList.contains('is-open')) {
        answer.style.maxHeight = 'none';
      }

      answer.removeEventListener('transitionend', onTransitionEnd);
    };

    answer.addEventListener('transitionend', onTransitionEnd);
  };

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');

    if (!question) {
      return;
    }

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          closeFaqItem(otherItem);
        }
      });

      if (isOpen) {
        closeFaqItem(item);
      } else {
        openFaqItem(item);
      }
    });
  });
});