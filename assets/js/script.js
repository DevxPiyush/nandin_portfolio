/* ===============================================
   CAPSULE NAVIGATION - GSAP ScrollTrigger
   =============================================== */
function initCapsuleNavigation() {
  // Capsule navigation removed; pill navbar is static.
}

function initPillNavActiveState() {
  const currentPath = window.location.pathname;
  const allNavLinks = document.querySelectorAll(".pill-link.nav-link");
  allNavLinks.forEach((link) => link.classList.remove("active"));

  let activeLink = null;
  if (currentPath.includes("work.html")) {
    activeLink = document.querySelector('a[href*="work.html"]');
  } else if (currentPath.includes("about.html")) {
    activeLink = document.querySelector('a[href*="about.html"]');
  } else if (currentPath.includes("contact.html")) {
    activeLink = document.querySelector('a[href*="contact.html"]');
  } else {
    // Default to Home on the index page
    activeLink = document.querySelector(
      '[data-scroll-to="hero"], a[href*="index.html"]',
    );
  }
  if (activeLink) activeLink.classList.add("active");

  // Dynamic active state on homepage using IntersectionObserver
  try {
    const sectionIds = ["hero", "services", "work"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    function linkForSection(id) {
      if (id === "hero")
        return document.querySelector('[data-scroll-to="hero"]');
      if (id === "services")
        return document.querySelector('[data-scroll-to="services"]');
      if (id === "work") return document.querySelector('a[href*="work.html"]'); // keep external Work link active when viewing homepage work section
      return null;
    }

    const io = new IntersectionObserver(
      (entries) => {
        // pick the entry most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id;
        const link = linkForSection(id);
        if (!link) return;
        allNavLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      },
      { threshold: [0.3, 0.6], rootMargin: "-20% 0px -40% 0px" },
    );

    sections.forEach((sec) => io.observe(sec));
  } catch (e) {
    /* noop */
  }
}

/* ===============================================
   MOBILE HAMBURGER MENU
   =============================================== */
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger-menu");
  const navLinks = document.getElementById("primary-navigation");
  const body = document.body;

  if (!hamburger || !navLinks) {
    return;
  }

  // Create backdrop if it doesn't exist
  let backdrop = document.querySelector(".mobile-menu-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "mobile-menu-backdrop";
    document.body.appendChild(backdrop);
  }

  // Toggle menu function
  function toggleMenu(forceClose = false) {
    const isOpen = navLinks.classList.contains("mobile-open");

    if (forceClose || isOpen) {
      navLinks.classList.remove("mobile-open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      backdrop.classList.remove("active");
      body.classList.remove("menu-open");
    } else {
      navLinks.classList.add("mobile-open");
      hamburger.classList.add("active");
      hamburger.setAttribute("aria-expanded", "true");
      backdrop.classList.add("active");
      body.classList.add("menu-open");
    }
  }

  // Toggle on hamburger button click
  hamburger.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Close on backdrop click
  backdrop.addEventListener("click", function (e) {
    e.preventDefault();
    toggleMenu(true);
  });

  // Close on navigation link click
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", function (e) {
      // Don't close if it's an external link or PDF
      const href = this.getAttribute("href");
      const isExternal =
        href &&
        (href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("pdf"));

      if (!isExternal && window.innerWidth <= 768) {
        // Close menu after navigation
        setTimeout(() => toggleMenu(true), 300);
      }
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("mobile-open")) {
      toggleMenu(true);
    }
  });

  // Close menu on resize to desktop
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (
        window.innerWidth > 768 &&
        navLinks.classList.contains("mobile-open")
      ) {
        toggleMenu(true);
      }
    }, 250);
  });
}

function initSite() {
  // Initialize nav active state for pill navbar
  initPillNavActiveState();

  // Initialize mobile hamburger menu
  initMobileMenu();

  // Handle anchor navigation on page load
  setTimeout(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.slice(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Use Locomotive Scroll if available
        if (
          window.locoScroll &&
          typeof window.locoScroll.scrollTo === "function"
        ) {
          window.locoScroll.scrollTo(targetElement, {
            duration: 1000,
            offset: 0,
          });
        } else {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, 800);

  // Shrink navbar on scroll
  (function initNavShrink() {
    const nav = document.getElementById("capsule-nav");
    if (!nav) return;
    const threshold = 80;
    function applyShrink(pos) {
      if (pos > threshold) nav.classList.add("shrink");
      else nav.classList.remove("shrink");
    }
    function attachToLoco(loco) {
      try {
        if (loco && typeof loco.on === "function") {
          loco.on("scroll", (args) => {
            const y = args && args.scroll && args.scroll.y ? args.scroll.y : 0;
            applyShrink(y);
          });
          // initial
          applyShrink(
            (loco.scroll &&
              loco.scroll.instance &&
              loco.scroll.instance.scroll &&
              loco.scroll.instance.scroll.y) ||
              0,
          );
          return true;
        }
      } catch (e) {
        /* noop */
      }
      return false;
    }

    // If Locomotive is already available, hook it; otherwise fallback and poll until available
    if (!attachToLoco(window.locoScroll)) {
      window.addEventListener("scroll", () => applyShrink(window.scrollY), {
        passive: true,
      });
      applyShrink(window.scrollY);
      // poll briefly to attach when loco initializes
      const start = Date.now();
      const timer = setInterval(() => {
        if (attachToLoco(window.locoScroll)) {
          clearInterval(timer);
        } else if (Date.now() - start > 4000) {
          clearInterval(timer);
        }
      }, 200);
    }
  })();

  // Smooth scroll for anchor links (compatible with Locomotive Scroll)
  // Delay initialization to allow Locomotive to set up
  setTimeout(() => {
    document
      .querySelectorAll('a[href^="#"], a[data-scroll-to]')
      .forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          const href = this.getAttribute("href");
          const scrollTarget = this.getAttribute("data-scroll-to");
          const targetId =
            scrollTarget ||
            (href && href.startsWith("#") ? href.slice(1) : null);

          if (!targetId) return;

          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            e.preventDefault();

            // Use Locomotive Scroll if available, otherwise fallback to native scroll
            if (
              window.locoScroll &&
              typeof window.locoScroll.scrollTo === "function"
            ) {
              window.locoScroll.scrollTo(targetElement, {
                duration: 1000,
                offset: 0,
              });
            } else {
              targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }
        });
      });
  }, 500);

  // Prefer GSAP/ScrollTrigger for fades if available; otherwise use IO fallback
  const hasGSAP =
    typeof window.gsap !== "undefined" &&
    typeof window.ScrollTrigger !== "undefined";
  if (!hasGSAP) {
    // Intersection Observer for fade-in animations (fallback)
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Apply fade-in to sections
    document.querySelectorAll(".section, .hero-section").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition =
        "opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
      observer.observe(el);
    });
  }

  // Service card hover effect (arrow slide)
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const arrow = card.querySelector(".arrow-icon");
      if (arrow) arrow.style.transform = "translate(4px, -4px)";
    });
    card.addEventListener("mouseleave", () => {
      const arrow = card.querySelector(".arrow-icon");
      if (arrow) arrow.style.transform = "translate(0, 0)";
    });
  });

  // Role Text Cycler
  const roles = [
    "Backend<br>Engineer",
    "AI/ML<br>Engineer",
    "DevOps<br>& Cloud",
    "Data<br>Analysis",
  ];
  let roleIndex = 0;
  const roleElement = document.getElementById("hero-role");

  if (roleElement) {
    // Ensure transition property exists for smooth fading
    roleElement.style.transition = "opacity 0.5s ease";

    setInterval(() => {
      // Fade out
      roleElement.style.opacity = "0";

      setTimeout(() => {
        // Update text and fade in
        roleIndex = (roleIndex + 1) % roles.length;
        roleElement.innerHTML = roles[roleIndex];
        roleElement.style.opacity = "1";
      }, 500); // Wait for fade out to complete
    }, 3500); // Change every 3.5 seconds
  }

  // Theme Toggle (uses icons instead of text)
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // SVG icons (inline strings)
  const sunIcon =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const moonIcon =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function setToggleIcon(theme) {
    if (!themeToggle) return;
    // When theme is 'dark' show sun icon (to switch to light), otherwise show moon icon
    themeToggle.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.setAttribute("data-theme", savedTheme);
    setToggleIcon(savedTheme);
  } else {
    // Initialize based on body attribute
    const initial =
      body.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setToggleIcon(initial);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = body.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      setToggleIcon(newTheme);
    });
  }

  // --- Accessibility: focus trap for mobile nav, splash screen, and custom cursor ---
  // We'll add a backdrop when the nav opens, trap focus inside nav while open,
  // and provide a small splash+cursor experience.

  // Backdrop and focus-trap helpers
  let backdropEl = null;
  let lastFocusedEl = null;
  let trapKeyHandler = null;
  // ignore outside clicks for a short period after opening to avoid immediate close races
  let ignoreOutsideClicksUntil = 0;

  function createBackdrop() {
    if (backdropEl) return backdropEl;
    backdropEl = document.createElement("div");
    backdropEl.className = "mobile-backdrop";
    backdropEl.addEventListener("click", () => setNavToggleState(false));
    document.body.appendChild(backdropEl);
    // allow CSS transition to kick in if present
    requestAnimationFrame(() => backdropEl.classList.add("show"));
    return backdropEl;
  }

  function removeBackdrop() {
    if (!backdropEl) return;
    backdropEl.classList.remove("show");
    // wait for transition (if any) then remove
    setTimeout(() => {
      if (backdropEl) {
        backdropEl.remove();
        backdropEl = null;
      }
    }, 260);
  }

  function getFocusableWithin(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);
  }

  function enableFocusTrap(container) {
    const focusables = getFocusableWithin(container);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    lastFocusedEl = document.activeElement;
    // Focus the first element inside the menu
    first.focus();

    trapKeyHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        setNavToggleState(false);
        return;
      }
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trapKeyHandler);
  }

  function disableFocusTrap() {
    if (trapKeyHandler) document.removeEventListener("keydown", trapKeyHandler);
    trapKeyHandler = null;
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function")
      lastFocusedEl.focus();
    lastFocusedEl = null;
  }

  // Splash/intro removed: no page-appear or homepage intro behavior

  // Custom cursor for pointer devices (disabled on touch)
  try {
    if (
      window.matchMedia &&
      window.matchMedia("(pointer: fine) and (min-width: 480px)").matches
    ) {
      const cursor = document.createElement("div");
      cursor.className = "cursor-dot";
      cursor.setAttribute("aria-hidden", "true");
      document.body.appendChild(cursor);

      document.addEventListener(
        "pointermove",
        (e) => {
          // position by left/top so CSS transform's translate(-50%,-50%) still centers the dot
          cursor.style.left = `${e.clientX}px`;
          cursor.style.top = `${e.clientY}px`;
        },
        { passive: true },
      );

      // Scale cursor on hover over interactive elements
      const hoverables = document.querySelectorAll("a, button, .btn");
      hoverables.forEach((el) => {
        el.addEventListener("pointerenter", () =>
          cursor.classList.add("hover"),
        );
        el.addEventListener("pointerleave", () =>
          cursor.classList.remove("hover"),
        );
      });
      // Enlarge cursor for hero role text to create a 'design' hover effect
      const heroRoleEl = document.getElementById("hero-role");
      if (heroRoleEl) {
        heroRoleEl.addEventListener("pointerenter", () =>
          cursor.classList.add("hero-hover"),
        );
        heroRoleEl.addEventListener("pointerleave", () =>
          cursor.classList.remove("hero-hover"),
        );
      }
      // Invert cursor color when hovering over navigation for better visibility
      const navElements = document.querySelectorAll(
        "#capsule-nav, #capsule-nav *",
      );
      navElements.forEach((el) => {
        el.addEventListener("pointerenter", () =>
          cursor.classList.add("nav-hover"),
        );
        el.addEventListener("pointerleave", () =>
          cursor.classList.remove("nav-hover"),
        );
      });
    }
  } catch (err) {
    // ignore environment where pointer media queries are not supported
    console.warn("Custom cursor skipped:", err);
  }

  // Hamburger / mobile nav toggle
  const navToggle = document.getElementById("nav-toggle");
  const navEl = document.querySelector(".nav");
  const navLive = document.getElementById("nav-live");
  function announceNavState(open) {
    try {
      if (!navLive) return;
      navLive.textContent = open
        ? "Navigation menu opened"
        : "Navigation menu closed";
    } catch (e) {
      /* ignore */
    }
  }
  // Create a nav-spot element that follows hovered nav links (desktop)
  let navSpot = null;
  try {
    if (navEl) {
      navSpot = document.createElement("div");
      navSpot.className = "nav-spot";
      navEl.appendChild(navSpot);

      // Move spot to hovered link center
      const navLinks = navEl.querySelectorAll(".nav-links a");
      navLinks.forEach((link) => {
        link.addEventListener("pointerenter", (e) => {
          const rect = link.getBoundingClientRect();
          const navRect = navEl.getBoundingClientRect();
          const cx = rect.left + rect.width / 2 - navRect.left;
          const cy = rect.top + rect.height / 2 - navRect.top;
          navSpot.style.left = `${cx}px`;
          navSpot.style.top = `${cy}px`;
          navSpot.classList.add("show");
        });
      });
      navEl.addEventListener("pointerleave", () => {
        navSpot.classList.remove("show");
      });
    }
  } catch (err) {
    // ignore if nav not present
  }
  const hamburgerIcon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const closeIcon =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function setNavToggleState(open) {
    if (!navToggle || !navEl) return;
    // update aria and icon immediately
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.innerHTML = open ? closeIcon : hamburgerIcon;

    // Toggle the class that controls CSS visibility
    if (open) {
      navEl.classList.add("open");
      // Lock scroll (Locomotive if available; else body overflow)
      try {
        const scrollContainer =
          document.querySelector("[data-scroll-container]") ||
          document.querySelector("main");
        if (window.locoScroll && typeof window.locoScroll.stop === "function") {
          window.locoScroll.stop();
        } else {
          document.body.classList.add("menu-open");
          if (scrollContainer) scrollContainer.style.pointerEvents = "none";
        }
      } catch (e) {
        /* ignore */
      }
      // set a small ignore window so the outside-click handler doesn't react to the same tap that opened the menu
      try {
        ignoreOutsideClicksUntil = performance.now() + 350;
      } catch (e) {
        ignoreOutsideClicksUntil = Date.now() + 350;
      }
      // ensure backdrop is created before trapping focus
      createBackdrop();
      // Defer enabling focus trap to next frame so CSS layout/visibility has applied
      requestAnimationFrame(() => {
        try {
          enableFocusTrap(navEl);
        } catch (e) {
          /* ignore */
        }
      });
      // announce for screen reader users
      announceNavState(true);
      // attach outside-click handler to close menu on small screens
      // attach on next frame so it doesn't see the same interaction that opened the menu
      requestAnimationFrame(() =>
        document.addEventListener("pointerdown", outsideNavHandler),
      );
    } else {
      navEl.classList.remove("open");
      // Unlock scroll
      try {
        const scrollContainer =
          document.querySelector("[data-scroll-container]") ||
          document.querySelector("main");
        if (
          window.locoScroll &&
          typeof window.locoScroll.start === "function"
        ) {
          window.locoScroll.start();
        } else {
          document.body.classList.remove("menu-open");
          if (scrollContainer) scrollContainer.style.pointerEvents = "";
        }
      } catch (e) {
        /* ignore */
      }
      // remove backdrop and restore focus on next frame
      requestAnimationFrame(() => {
        try {
          removeBackdrop();
        } catch (e) {
          /* ignore */
        }
        try {
          disableFocusTrap();
        } catch (e) {
          /* ignore */
        }
      });
      // announce for screen reader users
      announceNavState(false);
      // remove outside handler
      document.removeEventListener("pointerdown", outsideNavHandler);
    }
  }

  if (navToggle) {
    // initialize
    setNavToggleState(false);
    // Use pointer events for better responsiveness on touch devices
    navToggle.addEventListener("pointerup", (e) => {
      // don't preventDefault here — allow normal button semantics
      const isOpen = navEl.classList.contains("open");
      setNavToggleState(!isOpen);
    });
    // keyboard support
    navToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const isOpen = navEl.classList.contains("open");
        setNavToggleState(!isOpen);
      }
    });
    // close nav when a link is clicked (mobile)
    // delegate clicks from nav links to close the menu (works for dynamically added links)
    // Defer closing slightly so the browser can process the navigation before the menu DOM is removed.
    navEl.addEventListener("click", (ev) => {
      const a = ev.target.closest && ev.target.closest(".nav-links a[href]");
      if (a) {
        // If link is a hash on the same page, let the smooth-scroller handle it, then close
        // For normal navigation, deferring close by a short timeout avoids interrupting the navigation
        try {
          const href = a.getAttribute("href") || "";
          // If it's a mailto or target=_blank, just close immediately after click
          const target = a.getAttribute("target");
          const isBlank = target === "_blank";
          if (isBlank) {
            // let browser open new tab, close menu shortly after
            setTimeout(() => setNavToggleState(false), 60);
            return;
          }
          // Defer close to allow navigation/scroll to start. Slightly longer delay helps on mobile browsers.
          setTimeout(() => setNavToggleState(false), 300);
        } catch (err) {
          // fallback: close next frame
          requestAnimationFrame(() => setNavToggleState(false));
        }
      }
    });
  }

  // Close the nav when clicking/tapping outside of it (mobile)
  function outsideNavHandler(e) {
    try {
      // only active when nav is open
      if (!navEl.classList.contains("open")) return;
      // ignore immediate events that may have opened the menu (race on mobile)
      try {
        if (performance.now() < ignoreOutsideClicksUntil) return;
      } catch (err) {
        if (Date.now() < ignoreOutsideClicksUntil) return;
      }
      // if click is on the toggle or inside nav, ignore
      const path = e.composedPath ? e.composedPath() : e.path || [];
      for (let node of path) {
        if (!node) continue;
        if (node.id === "nav-toggle") return;
        if (node === navEl) return;
      }
      // otherwise close
      setNavToggleState(false);
    } catch (err) {
      /* ignore */
    }
  }

  // Contact form submission (AJAX) - posts to form action (e.g. Formspree)
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const statusNode = document.getElementById("form-status");
    const fallbackEmail =
      contactForm.dataset.email || "nandinijambhulkar1234@gmail.com";

    // Toast notification helper
    function showToast(message, type = "info", duration = 5000) {
      // Remove existing toast if any
      const existingToast = document.querySelector(".toast");
      if (existingToast) existingToast.remove();

      const toast = document.createElement("div");
      toast.className = `toast ${type}`;
      toast.setAttribute("role", "alert");
      toast.setAttribute("aria-live", "assertive");
      toast.textContent = message;
      document.body.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });

      // Auto-hide
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
      }, duration);
    }

    // Mailto fallback - opens user's email client
    function openMailtoFallback(formData) {
      const name = formData.get("name") || "";
      const email = formData.get("email") || "";
      const message = formData.get("message") || "";
      const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      );
      const mailtoLink = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
    }

    // Test/simulation mode - set window.FORM_TEST_MODE = true in console to test
    // Or add ?test=success or ?test=error to URL
    function isTestMode() {
      const urlParams = new URLSearchParams(window.location.search);
      return window.FORM_TEST_MODE || urlParams.has("test");
    }

    function getTestResult() {
      const urlParams = new URLSearchParams(window.location.search);
      const testParam = urlParams.get("test");
      if (testParam === "error")
        return { ok: false, error: "Simulated error for testing" };
      return { ok: true };
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : "";
      const formData = new FormData(contactForm);

      // Disable while submitting
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
        submitBtn.textContent = "Sending...";
      }

      if (statusNode) {
        statusNode.textContent = "Sending your message...";
        statusNode.style.color = "var(--text-muted)";
      }

      try {
        let result;

        // Check for test mode
        if (isTestMode()) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          result = getTestResult();
          console.log("[Test Mode] Simulated form submission:", result);
        } else {
          const action = contactForm.getAttribute("action");

          // Check if action is placeholder
          if (!action || action.includes("YOUR_FORM_ID")) {
            // No valid endpoint - use mailto fallback directly
            console.warn(
              "No valid form endpoint configured. Using mailto fallback.",
            );
            openMailtoFallback(formData);
            showToast("Opening your email client...", "info");
            if (statusNode) {
              statusNode.textContent = "Opening email client as fallback...";
              statusNode.style.color = "var(--accent-neon)";
            }
            return;
          }

          const resp = await fetch(action, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          });

          if (resp.ok) {
            result = { ok: true };
          } else {
            let errText = "There was a problem sending your message.";
            try {
              const data = await resp.json();
              if (data && data.error) errText = data.error;
            } catch (err) {
              /* ignore */
            }
            result = { ok: false, error: errText };
          }
        }

        // Handle result
        if (result.ok) {
          showToast(
            "Message sent successfully! I'll get back to you soon. 🎉",
            "success",
          );
          if (statusNode) {
            statusNode.textContent =
              "✓ Message sent! Thank you for reaching out.";
            statusNode.style.color = "var(--accent-neon)";
          }
          contactForm.reset();
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (err) {
        console.error("Contact form error:", err);

        // Show error and offer mailto fallback
        showToast(
          "Failed to send. Click to open email client instead.",
          "error",
          8000,
        );
        if (statusNode) {
          statusNode.innerHTML = `
            Unable to send message. 
            <a href="#" id="mailto-fallback" style="color: var(--accent-neon); text-decoration: underline; cursor: pointer;">
              Click here to email me directly
            </a>
          `;
          statusNode.style.color = "crimson";

          // Add fallback click handler
          const fallbackLink = document.getElementById("mailto-fallback");
          if (fallbackLink) {
            fallbackLink.addEventListener("click", (ev) => {
              ev.preventDefault();
              openMailtoFallback(formData);
            });
          }
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          submitBtn.style.opacity = "1";
        }
      }
    });
  }

  // Expose test helpers to window for console testing
  window.testContactForm = {
    simulateSuccess: () => {
      window.FORM_TEST_MODE = true;
      const form = document.getElementById("contact-form");
      if (form) {
        form.querySelector('[name="name"]').value = "Test User";
        form.querySelector('[name="email"]').value = "test@example.com";
        form.querySelector('[name="message"]').value =
          "This is a test message.";
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      }
    },
    simulateError: () => {
      const url = new URL(window.location);
      url.searchParams.set("test", "error");
      window.location.href = url;
    },
    reset: () => {
      window.FORM_TEST_MODE = false;
      const url = new URL(window.location);
      url.searchParams.delete("test");
      window.history.replaceState({}, "", url);
    },
  };
  console.log(
    "[Contact Form] Test helpers available: window.testContactForm.simulateSuccess(), .simulateError(), .reset()",
  );

  // ---- Lazy Loading: native + IntersectionObserver for data-src/data-bg ----
  (function setupLazyLoading() {
    try {
      // Native lazy for all images
      document.querySelectorAll("img").forEach((img) => {
        if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
        if (!img.hasAttribute("decoding"))
          img.setAttribute("decoding", "async");
      });

      // IO-based for images with data-src
      const lazyImgs = Array.from(document.querySelectorAll("img[data-src]"));
      const lazyBgs = Array.from(document.querySelectorAll("[data-bg]"));
      if (!lazyImgs.length && !lazyBgs.length) return; // nothing to observe

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.tagName === "IMG" && el.dataset.src) {
              el.src = el.dataset.src;
              el.removeAttribute("data-src");
            } else if (el.dataset.bg) {
              el.style.backgroundImage = `url(${el.dataset.bg})`;
              el.removeAttribute("data-bg");
            }
            io.unobserve(el);
          });
        },
        { rootMargin: "100px 0px" },
      );

      lazyImgs.concat(lazyBgs).forEach((el) => io.observe(el));
    } catch (e) {
      /* noop */
    }
  })();

  // ---- Locomotive Scroll + GSAP ScrollTrigger Integration ----
  (function setupSmoothScrollAndAnimations() {
    if (
      typeof window.LocomotiveScroll === "undefined" ||
      typeof window.gsap === "undefined" ||
      typeof window.ScrollTrigger === "undefined"
    ) {
      // If libraries missing, still add simple GSAP fades if gsap exists
      if (typeof window.gsap !== "undefined") {
        try {
          gsap.utils.toArray(".section, .hero-section").forEach((el) => {
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
            );
          });
        } catch (e) {
          /* noop */
        }
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const scrollContainer =
      document.querySelector("[data-scroll-container]") ||
      document.querySelector("main") ||
      document.body;
    const loco = new LocomotiveScroll({
      el: scrollContainer,
      smooth: true,
      lerp: 0.15,
      multiplier: 1.5,
    });
    // Expose for other scripts (e.g., nav scroll lock)
    window.locoScroll = loco;

    // Tell ScrollTrigger to use LocomotiveScroll as its scroller
    ScrollTrigger.scrollerProxy(scrollContainer, {
      scrollTop(value) {
        return arguments.length
          ? loco.scrollTo(value, { duration: 0, disableLerp: true })
          : loco.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: scrollContainer.style.transform ? "transform" : "fixed",
    });

    loco.on("scroll", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", () => loco.update());

    // Subtle page-enter motions
    try {
      gsap.from(".nav", {
        y: -20,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
      });
      if (document.querySelector(".hero-text")) {
        gsap.from(".hero-text", {
          autoAlpha: 0,
          y: 20,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.15,
        });
      }
    } catch (e) {
      /* noop */
    }

    // Fade-in sections on scroll
    gsap.utils.toArray(".section, .hero-section").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            scroller: scrollContainer,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    // Project image subtle parallax
    gsap.utils.toArray(".project-card .project-img").forEach((img) => {
      const triggerEl = img.closest(".project-card") || img;
      gsap.to(img, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: triggerEl,
          scroller: scrollContainer,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    });

    // Footer lift
    if (document.querySelector(".footer")) {
      gsap.from(".footer", {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".footer",
          scroller: scrollContainer,
          start: "top 90%",
        },
      });
    }

    // Refresh triggers after everything is set
    ScrollTrigger.refresh();
  })();
}

// Ensure the init runs even if the script is loaded after DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite);
} else {
  initSite();
}
