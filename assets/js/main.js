// ===== Hamburger Menu Toggle (defensive) =====
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".navbar ul");

if (menuToggle && navList) {
  menuToggle.addEventListener("click", () => {
    navList.classList.toggle("active");
  });

  document.querySelectorAll(".navbar ul li a").forEach((link) => {
    link.addEventListener("click", () => navList.classList.remove("active"));
  });
}

// ===== Fade-in Sections on Scroll =====
const sections = document.querySelectorAll("section");
if (sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => observer.observe(section));
} else {
  // Fallback: make sections visible if IntersectionObserver isn't supported
  sections.forEach((s) => s.classList.add("visible"));
}

// ===== Dark Mode Toggle =====
const darkModeBtn = document.createElement("button");
darkModeBtn.textContent = "Dark Mode";
darkModeBtn.classList.add("dark-mode-toggle");
// Add to header if present, otherwise to body
const headerEl = document.querySelector(".header");
if (headerEl) headerEl.appendChild(darkModeBtn);
else document.body.appendChild(darkModeBtn);

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  darkModeBtn.textContent = document.body.classList.contains("dark-mode")
    ? "Light Mode"
    : "Dark Mode";
});

// ===== Contact Form Submission (safe) =====
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default reload

    const nameEl = contactForm.querySelector("input[type='text']");
    const emailEl = contactForm.querySelector("input[type='email']");
    const textareaEl = contactForm.querySelector("textarea");

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const message = textareaEl ? textareaEl.value.trim() : "";

    // Simple validation
    if (!name || !email || !message) {
      alert("Please fill in all fields!");
      return;
    }

    // Optional: Email format validation (allow longer TLDs)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email.match(emailPattern)) {
      alert("Please enter a valid email!");
      return;
    }

    // Simulate form submission (you can integrate EmailJS or backend later)
    alert("Message sent successfully!\nThank you, " + name + "!");

    contactForm.reset(); // clear form
  });
}

// ===== Smooth Scroll for Navbar Links =====
document.querySelectorAll(".navbar ul li a").forEach((link) => {
  link.addEventListener("click", (e) => {
    // Let hamburger handler close menu first (if any)
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return; // ignore external links

    e.preventDefault();
    const targetId = href.slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});
