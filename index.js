// Vehicle tabs
document.querySelectorAll('.vtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.vtab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// ── Check if animations are disabled ──
// To re-enable animations: remove "no-animations" class from <body>
const animationsDisabled = document.body.classList.contains('no-animations');

// ── Check reduced motion preference ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!animationsDisabled) {

// ── Assign per-section stagger indices ──
// Each stagger group staggers its own children independently via --i CSS variable
[
  '.why-grid',
  '.services-grid',
  '.team-grid',
  '.contact-info-list',
  '.footer-inner',
  '.vehicles-heading',
  '.test-heading',
  '.brands-header',
].forEach(selector => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.querySelectorAll('.anim-item, .anim-heading, .footer-brand, .footer-col').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });
});

// ── One-shot reveal observer ──
// Elements animate in once, never re-animate on re-scroll
const animObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // fire once only
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.anim-item, .anim-heading, .anim-slide-right, .anim-slide-left-in, .anim-clip-up, .anim-scale-up, .anim-clip-right, .section-divider, .footer-brand, .footer-col'
).forEach(el => animObserver.observe(el));

// ── Section-level reveal observer ──
// Each section gets a subtle fade+lift as it scrolls into view (one-shot)
const sectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('section-revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.06 });

document.querySelectorAll(
  '.services-section, .vehicles-section, .why-section, .team-section, .testimonials-section, .contact-section, footer'
).forEach(el => sectionObserver.observe(el));

// ── Footer observer ──
const footerEl = document.getElementById('footer');
if (footerEl) {
  const footerObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  footerObserver.observe(footerEl);
}

} // end if (!animationsDisabled)

// ── Nav scroll effect ──
const heroSection = document.getElementById('home');
const navEl = document.querySelector('nav');

if (heroSection && navEl) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navEl.classList.remove('nav-scrolled');
      } else {
        navEl.classList.add('nav-scrolled');
      }
    });
  }, { threshold: 0.01 });
  navObserver.observe(heroSection);
}

// ── Scroll progress bar ──
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── Parallax on showroom image ──
if (!prefersReducedMotion && !animationsDisabled) {
  const showroomImg = document.querySelector('.showroom-img');
  if (showroomImg) {
    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(() => {
          const rect = showroomImg.getBoundingClientRect();
          const viewH = window.innerHeight;
          // Only apply when element is in viewport
          if (rect.top < viewH && rect.bottom > 0) {
            const ratio = (viewH - rect.top) / (viewH + rect.height);
            const offset = (ratio - 0.5) * -20; // max ±10px
            showroomImg.style.transform = 'translateY(' + offset + 'px)';
          }
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }, { passive: true });
  }
}

// ── Counter animation utility ──
function animateCounter(el, target, duration, isDecimal) {
  const start = performance.now();
  const initial = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = initial + (target - initial) * eased;

    if (isDecimal) {
      el.textContent = current.toFixed(1);
    } else {
      el.textContent = '$' + Math.round(current).toLocaleString('en-US');
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ── Counter animations on scroll ──
if (!prefersReducedMotion && !animationsDisabled) {
  // Rating counter
  const ratingNum = document.querySelector('.rating-badge .num[data-target]');
  if (ratingNum) {
    let ratingAnimated = false;
    const ratingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !ratingAnimated) {
          ratingAnimated = true;
          const target = parseFloat(entry.target.dataset.target);
          animateCounter(entry.target, target, 1500, true);
        }
        if (!entry.isIntersecting) {
          ratingAnimated = false;
          entry.target.textContent = '0.0';
        }
      });
    }, { threshold: 0.5 });
    ratingObserver.observe(ratingNum);
  }

  // Vehicle price counters
  document.querySelectorAll('.vehicle-price[data-price]').forEach(el => {
    let animated = false;
    const priceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          const target = parseInt(entry.target.dataset.price, 10);
          animateCounter(entry.target, target, 1200, false);
        }
        if (!entry.isIntersecting) {
          animated = false;
          entry.target.textContent = '$0';
        }
      });
    }, { threshold: 0.3 });
    priceObserver.observe(el);
  });
}

// ── SVG stroke draw initialization ──
if (!animationsDisabled) {
document.querySelectorAll('.service-card').forEach(card => {
  const paths = card.querySelectorAll('.service-icon-wrap svg path, .service-icon-wrap svg rect, .service-icon-wrap svg circle, .service-icon-wrap svg line');
  paths.forEach(path => {
    try {
      const length = path.getTotalLength ? path.getTotalLength() : 100;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    } catch (e) {
      // Some SVG elements may not support getTotalLength
    }
  });

  // Reset/animate on visibility
  const svgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const svgPaths = entry.target.querySelectorAll('.service-icon-wrap svg path, .service-icon-wrap svg rect, .service-icon-wrap svg circle, .service-icon-wrap svg line');
      if (entry.isIntersecting) {
        svgPaths.forEach(p => {
          p.style.strokeDashoffset = '0';
        });
      } else {
        svgPaths.forEach(p => {
          try {
            const len = p.getTotalLength ? p.getTotalLength() : 100;
            p.style.strokeDashoffset = len;
          } catch (e) {}
        });
      }
    });
  }, { threshold: 0.15 });
  svgObserver.observe(card);
});
} // end SVG stroke draw

// ══════════════════════════════════════════════════════════════
//  FEATURED VEHICLES CAROUSEL
// ══════════════════════════════════════════════════════════════
(function initVehiclesCarousel() {
  const carousel = document.querySelector('.vehicles-carousel');
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prevBtn = document.querySelector('.carousel-arrow-prev');
  const nextBtn = document.querySelector('.carousel-arrow-next');
  const indicatorsContainer = document.querySelector('.carousel-indicators');

  if (!carousel || !track || slides.length === 0) return;

  // Configuration
  let currentIndex = 0;
  let slidesPerView = 3;
  let autoplayInterval = null;
  const autoplayDelay = 5000; // 5 seconds
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Calculate slides per view based on viewport
  function calculateSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3;
  }

  // Calculate total pages (total slides minus visible slides)
  function getTotalPages() {
    return slides.length - slidesPerView;
  }

  // Update slides per view on resize
  function updateSlidesPerView() {
    const newSlidesPerView = calculateSlidesPerView();
    if (newSlidesPerView !== slidesPerView) {
      slidesPerView = newSlidesPerView;
      currentIndex = Math.min(currentIndex, getTotalPages() - 1);
      updateCarousel();
      createIndicators();
    }
  }

  // Generate dot indicators
  function createIndicators() {
    indicatorsContainer.innerHTML = '';
    const totalPages = getTotalPages();

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === currentIndex) dot.classList.add('active');

      dot.addEventListener('click', function() { goToSlide(i); });
      indicatorsContainer.appendChild(dot);
    }
  }

  // Update indicators
  function updateIndicators() {
    const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
    dots.forEach(function(dot, index) {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Update carousel position
  function updateCarousel(animate) {
    if (animate === undefined) animate = true;

    const slideWidth = slides[0].offsetWidth;
    const gap = 28; // Must match CSS gap
    // Move by 1 card at a time
    const moveDistance = (slideWidth + gap) * currentIndex;

    if (!animate) {
      track.style.transition = 'none';
    }

    track.style.transform = 'translateX(-' + moveDistance + 'px)';

    if (!animate) {
      // Force reflow
      track.offsetHeight;
      track.style.transition = '';
    }

    updateButtons();
    updateIndicators();
  }

  // Update button states
  function updateButtons() {
    const totalPages = getTotalPages();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages - 1;
  }

  // Navigate to specific slide
  function goToSlide(index) {
    const totalPages = getTotalPages();
    currentIndex = Math.max(0, Math.min(index, totalPages - 1));
    updateCarousel();
    resetAutoplay();
  }

  // Previous slide
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
      resetAutoplay();
    }
  }

  // Next slide
  function nextSlide() {
    const totalPages = getTotalPages();
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      updateCarousel();
      resetAutoplay();
    }
  }

  // Auto-play functionality
  function startAutoplay() {
    if (prefersReducedMotion || animationsDisabled) return;

    autoplayInterval = setInterval(function() {
      const totalPages = getTotalPages();
      if (currentIndex < totalPages - 1) {
        nextSlide();
      } else {
        // Loop back to start
        goToSlide(0);
      }
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Touch/Mouse drag functionality
  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function touchStart(index) {
    return function(event) {
      startPos = getPositionX(event);
      isDragging = true;
      animationID = requestAnimationFrame(animation);
      // Don't add is-dragging yet — wait for actual movement
      stopAutoplay();
    };
  }

  function touchMove(event) {
    if (isDragging) {
      const currentPosition = getPositionX(event);
      currentTranslate = prevTranslate + currentPosition - startPos;
      // Only apply drag visual state after real movement (not on simple click)
      if (Math.abs(currentTranslate) > 5) {
        track.classList.add('is-dragging');
        carousel.classList.add('is-dragging');
      }
    }
  }

  function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    track.classList.remove('is-dragging');
    carousel.classList.remove('is-dragging');

    const movedBy = currentTranslate - prevTranslate;

    // Swipe threshold: 50px or 15% of slide width
    const threshold = Math.max(50, slides[0].offsetWidth * 0.15);

    if (movedBy < -threshold && currentIndex < getTotalPages() - 1) {
      currentIndex++;
    }

    if (movedBy > threshold && currentIndex > 0) {
      currentIndex--;
    }

    currentTranslate = 0;
    prevTranslate = 0;
    updateCarousel();
    resetAutoplay();
  }

  function animation() {
    if (isDragging) {
      const slideWidth = slides[0].offsetWidth;
      const gap = 28;
      // Move by 1 card at a time
      const baseTranslate = -(slideWidth + gap) * currentIndex;
      track.style.transform = 'translateX(' + (baseTranslate + currentTranslate) + 'px)';
      requestAnimationFrame(animation);
    }
  }

  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Touch events
  slides.forEach(function(slide, index) {
    const touchStartHandler = touchStart(index);

    // Mouse events
    slide.addEventListener('mousedown', touchStartHandler);

    // Touch events
    slide.addEventListener('touchstart', touchStartHandler);

    // Prevent default image drag
    slide.addEventListener('dragstart', function(e) { e.preventDefault(); });
  });

  // Global mouse/touch move and end
  window.addEventListener('mousemove', touchMove);
  window.addEventListener('touchmove', touchMove);
  window.addEventListener('mouseup', touchEnd);
  window.addEventListener('touchend', touchEnd);

  // Pause autoplay on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Pause autoplay when user navigates away
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Window resize handler
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      updateSlidesPerView();
      updateCarousel(false); // No animation on resize
    }, 250);
  });

  // Initialize
  slidesPerView = calculateSlidesPerView();
  createIndicators();
  updateCarousel(false);
  startAutoplay();

  // Accessibility: Keyboard navigation
  document.addEventListener('keydown', function(e) {
    // Only handle if carousel is in viewport
    const rect = carousel.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;

    if (!isInView) return;

    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });
})();

