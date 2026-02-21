const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".navbar ul");
const navLinks = document.querySelectorAll(".navbar a");
const siteHeader = document.getElementById("site-header");
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeLabel = document.querySelector(".theme-label");
const form = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const sections = document.querySelectorAll("main section");

if (menuToggle && navList) {
  menuToggle.setAttribute("aria-controls", "main-menu");
  navList.id = "main-menu";

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    navList.classList.toggle("active");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navList.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

const toggleHeaderShadow = () => {
  if (!siteHeader) return;
  if (window.scrollY > 10) siteHeader.classList.add("scrolled");
  else siteHeader.classList.remove("scrolled");
};

toggleHeaderShadow();
window.addEventListener("scroll", toggleHeaderShadow, { passive: true });

if ("IntersectionObserver" in window && sections.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => revealObserver.observe(section));

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute("id");
        if (!id) return;

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", isActive);
        });
      });
    },
    {
      threshold: 0.55,
      rootMargin: "-20% 0px -30% 0px",
    }
  );

  sections.forEach((section) => navObserver.observe(section));
} else {
  sections.forEach((section) => section.classList.add("visible"));
}

const storedTheme = localStorage.getItem("portfolio-theme");
if (storedTheme === "dark") {
  document.body.classList.add("dark-mode");
}

if (themeToggle) {
  const syncThemeButton = () => {
    const isDark = document.body.classList.contains("dark-mode");
    if (themeIcon) themeIcon.textContent = isDark ? "🌙" : "☀";
    if (themeLabel) themeLabel.textContent = "Theme";
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  };

  syncThemeButton();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    syncThemeButton();
  });
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      if (formStatus) formStatus.textContent = "Please fill in all fields.";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) {
      if (formStatus) formStatus.textContent = "Please enter a valid email.";
      return;
    }

    if (formStatus) formStatus.textContent = `Thanks ${name}, your message is ready to send.`;
    form.reset();
  });
}

const yearEl = document.getElementById("copyright-year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
