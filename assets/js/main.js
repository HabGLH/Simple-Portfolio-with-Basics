const SELECTORS = {
  menuToggle: ".menu-toggle",
  navList: ".navbar ul",
  navLinks: ".navbar a",
  siteHeader: "#site-header",
  themeToggle: ".theme-toggle",
  themeIcon: ".theme-icon",
  themeLabel: ".theme-label",
  contactForm: ".contact-form",
  formStatus: ".form-status",
  sections: "main section",
  year: "#copyright-year",
};

const THEME_KEY = "portfolio-theme";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ui = {
  menuToggle: document.querySelector(SELECTORS.menuToggle),
  navList: document.querySelector(SELECTORS.navList),
  navLinks: document.querySelectorAll(SELECTORS.navLinks),
  siteHeader: document.querySelector(SELECTORS.siteHeader),
  themeToggle: document.querySelector(SELECTORS.themeToggle),
  themeIcon: document.querySelector(SELECTORS.themeIcon),
  themeLabel: document.querySelector(SELECTORS.themeLabel),
  form: document.querySelector(SELECTORS.contactForm),
  formStatus: document.querySelector(SELECTORS.formStatus),
  sections: document.querySelectorAll(SELECTORS.sections),
  year: document.querySelector(SELECTORS.year),
};

function initMobileMenu() {
  const { menuToggle, navList, navLinks } = ui;
  if (!menuToggle || !navList) return;

  navList.id = "main-menu";
  menuToggle.setAttribute("aria-controls", navList.id);

  const closeMenu = () => {
    navList.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  };

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    navList.classList.toggle("active");
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
}

function initHeaderShadowOnScroll() {
  const { siteHeader } = ui;
  if (!siteHeader) return;

  const updateHeaderState = () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 10);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

function initSectionRevealAndActiveNav() {
  const { sections, navLinks } = ui;
  if (!sections.length) return;

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.2 }
  );

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sectionId = entry.target.getAttribute("id");
        if (!sectionId) return;

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${sectionId}`;
          link.classList.toggle("active", isActive);
        });
      });
    },
    {
      threshold: 0.55,
      rootMargin: "-20% 0px -30% 0px",
    }
  );

  sections.forEach((section) => {
    revealObserver.observe(section);
    navObserver.observe(section);
  });
}

function initThemeToggle() {
  const { themeToggle, themeIcon, themeLabel } = ui;
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") document.body.classList.add("dark-mode");

  const syncThemeUI = () => {
    const isDark = document.body.classList.contains("dark-mode");

    if (themeIcon) themeIcon.textContent = isDark ? "🌙" : "☀";
    if (themeLabel) themeLabel.textContent = "Theme";

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  };

  syncThemeUI();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    syncThemeUI();
  });
}

function setFormStatus(message) {
  if (ui.formStatus) ui.formStatus.textContent = message;
}

function readContactFormData(form) {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    message: String(data.get("message") || "").trim(),
  };
}

function validateContactData({ name, email, message }) {
  if (!name || !email || !message) {
    return "Please fill in all fields.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email.";
  }

  return "";
}

async function submitToEndpoint(endpoint, payload) {
  const isFormspree = endpoint.includes("formspree.io");
  let response;

  if (isFormspree) {
    const body = new URLSearchParams(payload);
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  } else {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) throw new Error("Request failed");
}

function openMailClient(contactEmail, { name, email, message }) {
  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}

function initContactForm() {
  const { form } = ui;
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = readContactFormData(form);
    const submitBtn = form.querySelector("button[type='submit']");
    const validationMessage = validateContactData(payload);

    if (validationMessage) {
      setFormStatus(validationMessage);
      return;
    }

    const endpoint = form.dataset.endpoint;
    const contactEmail = form.dataset.contactEmail || "habtamu@example.com";

    if (submitBtn) submitBtn.disabled = true;
    setFormStatus("Sending your message...");

    try {
      if (endpoint) {
        await submitToEndpoint(endpoint, payload);
        setFormStatus("Message sent successfully.");
      } else {
        openMailClient(contactEmail, payload);
        setFormStatus(
          "Your email app has been opened. Send the drafted message there."
        );
      }

      form.reset();
    } catch {
      setFormStatus("Could not send right now. Please try again in a moment.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function initFooterYear() {
  if (ui.year) ui.year.textContent = String(new Date().getFullYear());
}

function init() {
  initMobileMenu();
  initHeaderShadowOnScroll();
  initSectionRevealAndActiveNav();
  initThemeToggle();
  initContactForm();
  initFooterYear();
}

init();
