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
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Animation & Interpolation Configuration
  let scrollThreshold = Math.min(window.innerHeight * 0.7, 500); // Distance over which transition completes
  let heroSize = 190; // Default base size matching CSS --globe-hero-size
  let ticking = false;

  // Easing function for bespoke editorial grace (easeInOutCubic)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Get active dimensions and coordinates
  function getCoordinates() {
    // Current slot position in fixed coordinates
    const slotRect = oSlot.getBoundingClientRect();
    
    // Read hero size from computed style
    heroSize = parseFloat(getComputedStyle(animatedGlobe).width) || 190;
    const targetSize = slotRect.width > 0 ? slotRect.width : 28;
    const targetScale = targetSize / heroSize;

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

  // Core render loop on scroll
  function updateScrollAnimation() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    
    // Calculate progress clamped strictly [0, 1]
    const rawProgress = Math.min(Math.max(scrollY / scrollThreshold, 0), 1);
    const progress = easeInOutCubic(rawProgress);

    const coords = getCoordinates();

    // Interpolate current center coordinates & scale
    const currentCenterX = (1 - progress) * coords.startX + progress * coords.endX;
    const currentCenterY = (1 - progress) * coords.startY + progress * coords.endY;
    const currentScale = (1 - progress) * 1.0 + progress * coords.targetScale;

    // Apply hardware-accelerated 3D transform
    // Note: animatedGlobe is positioned at top:0, left:0, so we translate its center
    const translateX = currentCenterX - heroSize / 2;
    const translateY = currentCenterY - heroSize / 2;

    animatedGlobe.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`;

    // Ambient glow and scroll cue fade-out
    if (ambientGlow) {
      ambientGlow.style.opacity = Math.max(0, 1 - rawProgress * 2.2);
    }
    if (scrollCue) {
      scrollCue.style.opacity = Math.max(0, 1 - rawProgress * 4.5);
    }

    // State threshold transitions
    if (rawProgress >= 0.5) {
      // Reveal N, VUS and APPAREL around the globe
      brandLogo.classList.add('logo-revealed');
      // Transition navbar to solid background
      navbar.classList.add('navbar-scrolled');
      // Transition globe stroke from white to dark obsidian
      animatedGlobe.classList.add('globe-in-navbar');
    } else {
      brandLogo.classList.remove('logo-revealed');
      navbar.classList.remove('navbar-scrolled');
      animatedGlobe.classList.remove('globe-in-navbar');
    }

    ticking = false;
  }

  // Request Animation Frame throttled scroll handler
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScrollAnimation);
      ticking = true;
    }
  }

  // Handle window resizing to keep target coordinates exact
  function onResize() {
    scrollThreshold = Math.min(window.innerHeight * 0.7, 500);
    updateScrollAnimation();
  }

  // Mobile Hamburger Drawer Toggle
  function setupMobileMenu() {
    if (!mobileToggle || !mobileDrawer) return;

    mobileToggle.addEventListener('click', function () {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function () {
        closeMobileDrawer();
      });
    });
  }

  function openMobileDrawer() {
    mobileDrawer.classList.add('open');
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  function closeMobileDrawer() {
    mobileDrawer.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Smooth Navigation Links handling
  function setupNavLinks() {
    const allLinks = document.querySelectorAll('a[href^="#"]');
    allLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Initial setup on DOM ready
  function init() {
    setupMobileMenu();
    setupNavLinks();
    
    // Initial paint
    updateScrollAnimation();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Re-verify position once all external fonts are loaded
    if (document.fonts) {
      document.fonts.ready.then(function () {
        updateScrollAnimation();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
