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
  const videoContainer = document.getElementById('hero-video-container');

  // The Thread Menu Elements
  const threadMenuTrigger = document.getElementById('thread-menu-trigger');
  const threadCloseBtn = document.getElementById('thread-close-btn');
  const threadOverlay = document.getElementById('thread-overlay');
  const threadNavLinks = document.querySelectorAll('.thread-nav-link');
  const overlayBrandLogo = document.getElementById('overlay-brand-logo');

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
      // Reveal N, VUS and APPAREL around the globe (globe replaces 'O' in NOVUS)
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
  // CONTINUOUS HERO VIDEO ENGINE (TEXTILE ENGINEERING & INDUSTRIAL PROCESS)
  // Seamless Crossfade: Video 01 -> 1000ms Crossfade -> Video 02 -> Repeat
  // ==========================================================================
  function setupHeroVideoCrossfade() {
    const v1 = document.getElementById('hero-video-1');
    const v2 = document.getElementById('hero-video-2');
    if (!v1 || !v2) return;

    // Crossfade duration: 1000ms
    const FADE_DURATION = 1.0;
    let isCrossfading = false;

    v1.muted = true;
    v2.muted = true;
    v1.playsInline = true;
    v2.playsInline = true;

    let activeVideo = v1;
    let queuedVideo = v2;

    function playSafely(video) {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // If browser policy delays unprompted autoplay, play on first interaction
          const unlock = () => {
            if (activeVideo) activeVideo.play().catch(() => { });
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('scroll', unlock);
          };
          window.addEventListener('click', unlock, { once: true });
          window.addEventListener('touchstart', unlock, { once: true });
          window.addEventListener('scroll', unlock, { once: true });
        });
      }
    }

    function triggerCrossfade() {
      if (isCrossfading) return;
      isCrossfading = true;

      // Start queued video at beginning and play before fade starts to guarantee zero black frames
      queuedVideo.currentTime = 0;
      queuedVideo.classList.remove('is-active', 'is-outgoing');
      queuedVideo.classList.add('is-incoming');

      const playPromise = queuedVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }

      // Fade out active video
      activeVideo.classList.remove('is-active', 'is-incoming');
      activeVideo.classList.add('is-outgoing');

      // After 1000ms crossfade duration
      setTimeout(() => {
        // Queued video is now active
        queuedVideo.classList.remove('is-incoming');
        queuedVideo.classList.add('is-active');

        // Reset and pause previous video
        activeVideo.classList.remove('is-outgoing');
        activeVideo.pause();
        activeVideo.currentTime = 0;

        // Swap references
        const temp = activeVideo;
        activeVideo = queuedVideo;
        queuedVideo = temp;

        isCrossfading = false;
      }, FADE_DURATION * 1000);
    }

    function onTimeUpdate(e) {
      const vid = e.target;
      if (vid !== activeVideo || isCrossfading) return;

      // Trigger crossfade when active video is 1.0s away from completion
      if (vid.duration && vid.currentTime >= vid.duration - FADE_DURATION) {
        triggerCrossfade();
      }
    }

    v1.addEventListener('timeupdate', onTimeUpdate);
    v2.addEventListener('timeupdate', onTimeUpdate);

    // Backup safety event in case of duration seek
    v1.addEventListener('ended', () => {
      if (activeVideo === v1 && !isCrossfading) triggerCrossfade();
    });
    v2.addEventListener('ended', () => {
      if (activeVideo === v2 && !isCrossfading) triggerCrossfade();
    });

    // Start Video 01
    playSafely(v1);

    // Keep active video playing on window focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && activeVideo) {
        activeVideo.play().catch(() => { });
      }
    });

    // Watchdog: guarantee continuous playback never stalls
    setInterval(() => {
      if (activeVideo && activeVideo.paused && !document.hidden) {
        activeVideo.play().catch(() => { });
      }
    }, 1500);
  }

  // Initial setup on DOM ready
  function init() {
    setupThreadMenu();
    setupHeroVideoCrossfade();

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
