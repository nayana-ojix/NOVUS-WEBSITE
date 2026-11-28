/**
 * NOVUS APPAREL — HIGH FASHION & ATELIER CRAFTSMANSHIP
 * Scroll Animation Engine & Navbar Controller
 */

(function () {
  'use strict';

  // DOM Elements
  const navbar = document.getElementById('main-navbar');
  const brandLogo = document.getElementById('brand-logo');
  const oSlot = document.getElementById('logo-o-slot');
  const animatedGlobe = document.getElementById('animated-globe-wrapper');
  const ambientGlow = document.getElementById('ambient-glow');
  const scrollCue = document.getElementById('scroll-cue');
  const heroImageContainer = document.getElementById('hero-image-container');
  const heroStatement = document.getElementById('hero-statement-container');

  // The Thread Menu Elements
  const threadMenuTrigger = document.getElementById('thread-menu-trigger');
  const threadCloseBtn = document.getElementById('thread-close-btn');
  const threadOverlay = document.getElementById('thread-overlay');
  const threadNavLinks = document.querySelectorAll('.thread-nav-link');
  const overlayBrandLogo = document.getElementById('overlay-brand-logo');

  // Animation & Interpolation Configuration
  let heroWidth = 180; // Base width matching CSS --globe-hero-width
  let heroHeight = 192.41; // Base height matching CSS --globe-hero-height
  let introComplete = false;
  let introStartTime = null;
  const INTRO_DELAY = 350; // ms to pause at center before moving
  const INTRO_DURATION = 1500; // ms for globe to glide from center to navbar

  // Easing function for bespoke editorial grace (easeInOutCubic)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Get active dimensions and coordinates
  function getCoordinates() {
    // Current slot position in fixed coordinates
    const slotRect = oSlot.getBoundingClientRect();

    // Read hero dimensions from computed style
    heroWidth = parseFloat(getComputedStyle(animatedGlobe).width) || 180;
    heroHeight = parseFloat(getComputedStyle(animatedGlobe).height) || 192.41;
    const targetSize = slotRect.width > 0 ? slotRect.width : 29.85;
    const targetScale = targetSize / heroWidth;

    // Viewport Center
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    // Target Center (inside navbar logo slot)
    const endX = slotRect.left + slotRect.width / 2;
    const endY = slotRect.top + slotRect.height / 2;

    return {
      startX,
      startY,
      endX,
      endY,
      targetScale
    };
  }

  // Apply globe position, scale, and state transitions
  function setGlobePosition(progress, rawProgress) {
    if (rawProgress === undefined) rawProgress = progress;
    const coords = getCoordinates();

    // Interpolate current center coordinates & scale
    const currentCenterX = (1 - progress) * coords.startX + progress * coords.endX;
    const currentCenterY = (1 - progress) * coords.startY + progress * coords.endY;
    const currentScale = (1 - progress) * 1.0 + progress * coords.targetScale;

    // Apply hardware-accelerated 3D transform
    const translateX = currentCenterX - heroWidth / 2;
    const translateY = currentCenterY - heroHeight / 2;

    animatedGlobe.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`;

    // Ambient glow fade-out
    if (ambientGlow) {
      ambientGlow.style.opacity = Math.max(0, 1 - rawProgress * 2.2);
    }

    // State threshold transitions: reveal N, VUS, APPAREL around globe
    if (rawProgress >= 0.5) {
      brandLogo.classList.add('logo-revealed');
      navbar.classList.add('navbar-scrolled');
      animatedGlobe.classList.add('globe-in-navbar');
    } else {
      brandLogo.classList.remove('logo-revealed');
      navbar.classList.remove('navbar-scrolled');
      animatedGlobe.classList.remove('globe-in-navbar');
    }
  }

  // Automatic intro animation on website open
  function runIntroAnimation(timestamp) {
    if (introComplete) return;
    if (!introStartTime) introStartTime = timestamp;
    const elapsed = timestamp - introStartTime;

    if (elapsed < INTRO_DELAY) {
      setGlobePosition(0, 0);
      requestAnimationFrame(runIntroAnimation);
      return;
    }

    const animElapsed = elapsed - INTRO_DELAY;
    const rawProgress = Math.min(Math.max(animElapsed / INTRO_DURATION, 0), 1);
    const progress = easeInOutCubic(rawProgress);

    setGlobePosition(progress, rawProgress);

    if (rawProgress < 1) {
      requestAnimationFrame(runIntroAnimation);
    } else {
      introComplete = true;
      setGlobePosition(1, 1);
      // Reveal editorial statement at absolute center once globe reaches navbar
      if (heroStatement) {
        heroStatement.classList.add('is-visible');
      }
      // Reveal scroll invitation cue
      if (scrollCue) {
        scrollCue.classList.add('is-visible');
      }
    }
  }

  // Scroll handler
  function onScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // If user scrolls during intro, complete immediately so layout is stable
    if (!introComplete && scrollY > 20) {
      introComplete = true;
      setGlobePosition(1, 1);
      if (heroStatement) heroStatement.classList.add('is-visible');
      if (scrollCue) scrollCue.classList.remove('is-visible');
      return;
    }

    // Toggle scroll cue on scroll
    if (scrollCue) {
      if (scrollY > 30) {
        scrollCue.classList.remove('is-visible');
      } else if (introComplete) {
        scrollCue.classList.add('is-visible');
      }
    }

    // Keep docked position exact on scroll
    if (introComplete) {
      setGlobePosition(1, 1);
    }
  }

  // Handle window resizing
  function onResize() {
    if (introComplete) {
      setGlobePosition(1, 1);
    } else {
      setGlobePosition(0, 0);
    }
  }

  // ==========================================================================
  // THE THREAD MENU CONTROLLER (OPEN / CLOSE / ESCAPE / SMOOTH SCROLL)
  // ==========================================================================
  function setupThreadMenu() {
    if (!threadMenuTrigger || !threadOverlay) return;

    // Open Overlay
    threadMenuTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      openThreadMenu();
    });

    // Close Button Click
    if (threadCloseBtn) {
      threadCloseBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeThreadMenu();
      });
    }

    // Overlay Brand Logo Click
    if (overlayBrandLogo) {
      overlayBrandLogo.addEventListener('click', function (e) {
        closeThreadMenu();
      });
    }

    // Keyboard ESC listener
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && threadOverlay.classList.contains('is-open')) {
        closeThreadMenu();
      }
    });

    // Navigation Links Click Handler
    threadNavLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        // Graceful close of overlay
        closeThreadMenu();

        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            setTimeout(() => {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }
        }
      });
    });
  }

  function openThreadMenu() {
    threadOverlay.classList.add('is-open');
    threadMenuTrigger.setAttribute('aria-expanded', 'true');
    threadOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeThreadMenu() {
    threadOverlay.classList.remove('is-open');
    threadMenuTrigger.setAttribute('aria-expanded', 'false');
    threadOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }



  // ==========================================================================
  // ABOUT US SECTION CONTROLLER (STAGGERED ENTRANCE & HEADLINE TABS)
  // ==========================================================================
  function setupAboutSection() {
    const aboutSection = document.getElementById('about-us');
    if (!aboutSection) return;

    // Trigger headline entrance animation only once when section enters viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              aboutSection.classList.add('is-revealed');
              observer.unobserve(aboutSection);
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(aboutSection);
    } else {
      aboutSection.classList.add('is-revealed');
    }

    // Headline click interactions
    const headlines = aboutSection.querySelectorAll('.about-headline');
    const panels = aboutSection.querySelectorAll('.about-panel');

    headlines.forEach((btn) => {
      btn.addEventListener('click', function () {
        const targetIdx = this.getAttribute('data-index');

        headlines.forEach((h) => {
          h.classList.remove('is-active');
          h.setAttribute('aria-selected', 'false');
        });
        panels.forEach((p) => {
          p.classList.remove('is-active');
        });

        this.classList.add('is-active');
        this.setAttribute('aria-selected', 'true');

        const targetPanel = aboutSection.querySelector(`.about-panel[data-index="${targetIdx}"]`);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
        }
      });
    });
  }

  // ==========================================================================
  // LEADERSHIP SECTION CONTROLLER (INDEPENDENT TAP-TO-REVEAL FOR MOBILE)
  // ==========================================================================
  function setupLeadershipSection() {
    const founderCards = document.querySelectorAll('.founder-card');
    if (!founderCards.length) return;

    founderCards.forEach((card) => {
      card.addEventListener('click', function (e) {
        const isActive = this.classList.contains('is-active');
        founderCards.forEach((c) => c.classList.remove('is-active'));
        if (!isActive) {
          this.classList.add('is-active');
        }
      });
    });

    // Close overlay on click outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.founder-card')) {
        founderCards.forEach((c) => c.classList.remove('is-active'));
      }
    });
  }

  // ==========================================================================
  // TECHNOLOGY PARTNERS SECTION CONTROLLER (SCROLL REVEAL & IMAGE ZOOM)
  // ==========================================================================
  function setupTechPartnersSection() {
    const techSection = document.getElementById('technology-partners');
    if (!techSection) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              techSection.classList.add('is-revealed');
              observer.unobserve(techSection);
            }
          });
        },
        { threshold: 0.18 }
      );
      observer.observe(techSection);
    } else {
      techSection.classList.add('is-revealed');
    }
  }

  // ==========================================================================
  // DESIGN & PRODUCTS GALLERY CONTROLLER (TOUCH TOGGLE FOR MOBILE)
  // ==========================================================================
  function setupProductsGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    galleryItems.forEach((item) => {
      item.addEventListener('click', function () {
        const isActive = this.classList.contains('is-active');
        galleryItems.forEach((it) => it.classList.remove('is-active'));
        if (!isActive) {
          this.classList.add('is-active');
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.gallery-item')) {
        galleryItems.forEach((it) => it.classList.remove('is-active'));
      }
    });
  }

  // ==========================================================================
  // FACTORIES SECTION CONTROLLER (ANIMATED COUNTERS & MARQUEE INTERACTION)
  // ==========================================================================
  function setupFactoriesSection() {
    const factoriesSection = document.getElementById('factories');
    if (!factoriesSection) return;

    let countersAnimated = false;
    const counterElements = factoriesSection.querySelectorAll('.counter-value');

    function animateCounters() {
      if (countersAnimated) return;
      countersAnimated = true;

      const duration = 1900; // 1.9s smooth counting animation
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);

        counterElements.forEach((el) => {
          const start = parseFloat(el.getAttribute('data-start'));
          const end = parseFloat(el.getAttribute('data-end'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const isLocale = el.getAttribute('data-format') === 'locale';

          const currentVal = Math.round(start + (end - start) * ease);
          const formattedVal = isLocale ? currentVal.toLocaleString('en-US') : currentVal;

          el.textContent = `${prefix}${formattedVal}${suffix}`;
        });

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          // Guarantee exact target figures
          counterElements.forEach((el) => {
            const end = parseFloat(el.getAttribute('data-end'));
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const isLocale = el.getAttribute('data-format') === 'locale';
            const formattedVal = isLocale ? end.toLocaleString('en-US') : end;
            el.textContent = `${prefix}${formattedVal}${suffix}`;
          });
        }
      }

      requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounters();
              observer.unobserve(factoriesSection);
            }
          });
        },
        { threshold: 0.18 }
      );
      observer.observe(factoriesSection);
    } else {
      animateCounters();
    }

    // Touch support for mobile factory gallery item captions
    const factoryItems = factoriesSection.querySelectorAll('.factory-item');
    factoryItems.forEach((item) => {
      item.addEventListener('click', function () {
        const isActive = this.classList.contains('is-active');
        factoryItems.forEach((it) => it.classList.remove('is-active'));
        if (!isActive) {
          this.classList.add('is-active');
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.factory-item')) {
        factoryItems.forEach((it) => it.classList.remove('is-active'));
      }
    });
  }

  // ==========================================================================
  // SECTION 07 — CONTACT US CONTROLLER (INTERACTIVE GOLDEN MAP & OFFICES)
  // ==========================================================================
  function setupContactSection() {
    const contactSection = document.getElementById('contact-us');
    if (!contactSection) return;

    const markers = contactSection.querySelectorAll('.interactive-marker');
    const tabs = contactSection.querySelectorAll('.location-tab');
    const officeCards = contactSection.querySelectorAll('.office-card');

    function setActiveLocation(locationId, shouldScroll) {
      if (!locationId) return;

      // Update Tabs
      tabs.forEach((tab) => {
        const isMatch = tab.getAttribute('data-target') === locationId;
        tab.classList.toggle('is-active', isMatch);
        tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      // Update Map Markers
      markers.forEach((marker) => {
        const isMatch = marker.getAttribute('data-location') === locationId;
        marker.classList.toggle('is-active', isMatch);
      });

      // Update Office Showcase with smooth fade transition
      officeCards.forEach((card) => {
        const isMatch = card.getAttribute('data-location') === locationId;
        if (isMatch) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      // On mobile screens, scroll smoothly to the office card if clicked from marker
      if (shouldScroll && window.innerWidth <= 768) {
        const activeCard = contactSection.querySelector(`.office-card[data-location="${locationId}"]`);
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }

    // Attach Marker Click & Keyboard Events
    markers.forEach((marker) => {
      marker.addEventListener('click', function (e) {
        e.preventDefault();
        const loc = this.getAttribute('data-location');
        setActiveLocation(loc, true);
      });

      marker.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const loc = this.getAttribute('data-location');
          setActiveLocation(loc, true);
        }
      });
    });

    // Attach Tab Button Click Events
    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        const loc = this.getAttribute('data-target');
        setActiveLocation(loc, false);
      });
    });
  }

  // Initial setup on DOM ready
  function init() {
    // Check initial scroll position: if page is loaded at top, trigger auto intro animation
    try {
      const initialScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (initialScrollY > 50) {
        introComplete = true;
        setGlobePosition(1, 1);
        if (heroStatement) heroStatement.classList.add('is-visible');
      } else {
        setGlobePosition(0, 0);
        requestAnimationFrame(runIntroAnimation);
      }
    } catch (err) {
      console.error('Intro animation init error:', err);
    }

    try { setupThreadMenu(); } catch (e) { console.error(e); }
    try { setupAboutSection(); } catch (e) { console.error(e); }
    try { setupLeadershipSection(); } catch (e) { console.error(e); }
    try { setupTechPartnersSection(); } catch (e) { console.error(e); }
    try { setupProductsGallery(); } catch (e) { console.error(e); }
    try { setupFactoriesSection(); } catch (e) { console.error(e); }
    try { setupContactSection(); } catch (e) { console.error(e); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Re-verify position once all external fonts are loaded
    if (document.fonts) {
      document.fonts.ready.then(function () {
        if (introComplete) {
          setGlobePosition(1, 1);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
