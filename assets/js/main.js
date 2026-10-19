/**
 * Habtamu Genet Portfolio - Main Script
 * Handles navigation, theme toggling, scroll reveals, active state tracking,
 * developer terminal copy, back-to-top button, and interactive contact form.
 */

(function () {
  "use strict";

  const THEME_STORAGE_KEY = "portfolio-theme";
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const elements = {
    header: document.getElementById("site-header"),
    navMenu: document.getElementById("main-menu"),
    menuToggle: document.getElementById("menu-toggle-btn"),
    navLinks: document.querySelectorAll(".nav-item"),
    sections: document.querySelectorAll("main section"),
    themeToggle: document.getElementById("theme-toggle-btn"),
    contactForm: document.getElementById("contact-form"),
    formStatus: document.getElementById("form-status-msg"),
    submitBtn: document.getElementById("submit-btn"),
    copySummaryBtn: document.getElementById("copy-summary-btn"),
    backToTopBtn: document.getElementById("back-to-top-btn"),
    copyrightYear: document.getElementById("copyright-year"),
  };

  /**
   * Theme Switcher (Dark / Light Mode)
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ? savedTheme : prefersDark ? "dark" : "dark"; // Defaulting to sleek dark

    applyTheme(initialTheme);

    if (elements.themeToggle) {
      elements.themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-mode");
        const nextTheme = isDark ? "light" : "dark";
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      });
    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }

  /**
   * Mobile Hamburger Menu
   */
  function initMobileMenu() {
    const { menuToggle, navMenu, navLinks } = elements;
    if (!menuToggle || !navMenu) return;

    const navList = navMenu.querySelector(".nav-links");
    if (!navList) return;

    function openMenu() {
      navList.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close navigation menu");
    }

    function closeMenu() {
      navList.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    }

    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when clicking nav items
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navList.classList.contains("active")) {
        closeMenu();
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /**
   * Header Scroll Appearance
   */
  function initHeaderScroll() {
    const { header } = elements;
    if (!header) return;

    function checkScroll() {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
  }

  /**
   * Scroll Reveal & Active Navigation Spy
   */
  function initScrollSpyAndReveal() {
    const { sections, navLinks, header } = elements;
    if (!sections.length) return;

    // IntersectionObserver for Section Reveal Animation
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.12 }
      );

      sections.forEach((section) => revealObserver.observe(section));
    } else {
      sections.forEach((section) => section.classList.add("visible"));
    }

    // ScrollSpy to highlight active link in header
    function updateActiveNav() {
      const headerHeight = header ? header.offsetHeight : 76;
      const scrollPos = window.scrollY + headerHeight + 60;

      let currentId = "";

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = section.getAttribute("id");
        }
      });

      if (!currentId && sections.length > 0) {
        currentId = sections[0].getAttribute("id");
      }

      navLinks.forEach((link) => {
        const targetId = (link.getAttribute("href") || "").replace("#", "");
        if (targetId.toLowerCase() === (currentId || "").toLowerCase()) {
          link.classList.add("active");
          link.setAttribute("aria-current", "page");
        } else {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
    updateActiveNav();
  }

  /**
   * Developer Terminal Copy Button
   */
  function initTerminalCopy() {
    const { copySummaryBtn } = elements;
    if (!copySummaryBtn) return;

    const terminalCode = document.querySelector(".terminal-body code");
    if (!terminalCode) return;

    const copyTextEl = copySummaryBtn.querySelector(".copy-btn-text");

    copySummaryBtn.addEventListener("click", async () => {
      try {
        const rawText = terminalCode.textContent || "";
        await navigator.clipboard.writeText(rawText);

        if (copyTextEl) copyTextEl.textContent = "Copied!";
        copySummaryBtn.style.borderColor = "var(--emerald)";

        setTimeout(() => {
          if (copyTextEl) copyTextEl.textContent = "Copy";
          copySummaryBtn.style.borderColor = "";
        }, 2200);
      } catch (err) {
        if (copyTextEl) copyTextEl.textContent = "Failed";
        setTimeout(() => {
          if (copyTextEl) copyTextEl.textContent = "Copy";
        }, 2000);
      }
    });
  }

  /**
   * Contact Form Handling & Validation
   */
  function initContactForm() {
    const { contactForm, formStatus, submitBtn } = elements;
    if (!contactForm) return;

    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const messageError = document.getElementById("message-error");

    function clearErrors() {
      if (nameError) nameError.textContent = "";
      if (emailError) emailError.textContent = "";
      if (messageError) messageError.textContent = "";
      if (formStatus) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
      }
    }

    // Clear field-level error on typing
    [nameInput, emailInput, messageInput].forEach((input) => {
      if (input) {
        input.addEventListener("input", () => {
          clearErrors();
        });
      }
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const nameVal = (nameInput?.value || "").trim();
      const emailVal = (emailInput?.value || "").trim();
      const messageVal = (messageInput?.value || "").trim();
      const subjectVal = (document.getElementById("contact-subject")?.value || "").trim();

      let hasError = false;

      if (!nameVal) {
        if (nameError) nameError.textContent = "Please enter your name.";
        hasError = true;
      }

      if (!emailVal) {
        if (emailError) emailError.textContent = "Please enter your email address.";
        hasError = true;
      } else if (!EMAIL_REGEX.test(emailVal)) {
        if (emailError) emailError.textContent = "Please enter a valid email address.";
        hasError = true;
      }

      if (!messageVal) {
        if (messageError) messageError.textContent = "Please write a message.";
        hasError = true;
      }

      if (hasError) return;

      const endpoint = contactForm.dataset.endpoint;
      const fallbackEmail = contactForm.dataset.contactEmail || "habtamug.tb@gmail.com";

      // Enter loading state
      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
      }
      if (formStatus) {
        formStatus.textContent = "Sending your message...";
        formStatus.className = "form-status";
      }

      try {
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: nameVal,
              email: emailVal,
              subject: subjectVal || "Portfolio Contact",
              message: messageVal,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }

          if (formStatus) {
            formStatus.textContent = "✓ Thank you! Your message was sent successfully. I'll get back to you soon.";
            formStatus.className = "form-status success";
          }
          contactForm.reset();
        } else {
          // Fallback to mailto
          openMailClient(fallbackEmail, { name: nameVal, email: emailVal, subject: subjectVal, message: messageVal });
          if (formStatus) {
            formStatus.textContent = "Opening your email client to dispatch the message...";
            formStatus.className = "form-status success";
          }
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = "Unable to send right now. Opening your default mail client...";
          formStatus.className = "form-status error";
        }
        // Fallback to mailto if API fails
        setTimeout(() => {
          openMailClient(fallbackEmail, { name: nameVal, email: emailVal, subject: subjectVal, message: messageVal });
        }, 800);
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove("loading");
          submitBtn.disabled = false;
        }
      }
    });
  }

  function openMailClient(recipient, { name, email, subject, message }) {
    const mailSubject = encodeURIComponent(subject || `Portfolio Contact from ${name}`);
    const mailBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;
  }

  /**
   * Back to Top Smooth Scroll
   */
  function initBackToTop() {
    const { backToTopBtn } = elements;
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /**
   * Dynamic Footer Copyright Year
   */
  function initCopyrightYear() {
    const { copyrightYear } = elements;
    if (copyrightYear) {
      copyrightYear.textContent = String(new Date().getFullYear());
    }
  }

  // Initialize all interactive modules on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileMenu();
    initHeaderScroll();
    initScrollSpyAndReveal();
    initTerminalCopy();
    initContactForm();
    initBackToTop();
    initCopyrightYear();
  });
})();
