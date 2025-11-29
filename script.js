/*
script.js
Client-side functionality:
- Sidebar toggle for small screens (keyboard accessible)
- Dark/Light theme toggle with persistence in localStorage
- Contact form client-side validation and success UI
- Small accessibility helpers (set year, focus management)
*/

// ---------- Helpers ----------
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) =>
  Array.from((ctx || document).querySelectorAll(sel));

// ---------- YEAR ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- THEME: load/save ----------
const THEME_KEY = "portfolio_theme";
const root = document.documentElement;

function applyTheme(theme) {
  if (theme === "dark") {
    root.classList.add("dark-theme");
    setThemeToggleButtons(true);
  } else {
    root.classList.remove("dark-theme");
    setThemeToggleButtons(false);
  }
  // set theme-color meta (useful for mobile/browser)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta)
    meta.setAttribute("content", theme === "dark" ? "#0f1724" : "#ffffff");
}

function setThemeToggleButtons(isDark) {
  // update aria-pressed and icon
  const btns = qsa("#themeToggleHeader, #themeToggleSidebar");
  btns.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(isDark));
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = isDark ? "fa-solid fa-sun" : "fa-regular fa-moon";
    }
  });
}

function savedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (e) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
}

// initialize
(function initTheme() {
  const saved = savedTheme();
  if (saved) {
    applyTheme(saved);
  } else {
    // default: follow OS preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
    storeTheme(prefersDark ? "dark" : "light");
  }
})();

// wire theme toggle buttons
qsa("#themeToggleHeader, #themeToggleSidebar").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const isPressed = btn.getAttribute("aria-pressed") === "true";
    const newTheme = isPressed ? "light" : "dark";
    applyTheme(newTheme);
    storeTheme(newTheme);
  });

  // keyboard accessibility: space & enter should toggle already via click, but ensure role present
  btn.setAttribute("role", "button");
});

// ---------- SIDEBAR (mobile) ----------
const sidebarToggle = qs("#sidebarToggle");
const sidebarClose = qs("#sidebarClose");
const body = document.body;

function openSidebar() {
  body.classList.add("sidebar-open");
  sidebarToggle.setAttribute("aria-expanded", "true");
  // move focus into sidebar for keyboard users
  const firstLink = qs("#sidebar nav a");
  if (firstLink) firstLink.focus();
}

function closeSidebar() {
  body.classList.remove("sidebar-open");
  sidebarToggle.setAttribute("aria-expanded", "false");
  // return focus to toggler
  sidebarToggle.focus();
}

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    if (body.classList.contains("sidebar-open")) closeSidebar();
    else openSidebar();
  });
}

// close by close button
if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);

// close on Escape key when sidebar is open
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && body.classList.contains("sidebar-open")) {
    closeSidebar();
  }
});

// If user clicks outside sidebar on mobile, close it
document.addEventListener("click", (e) => {
  if (!body.classList.contains("sidebar-open")) return;
  const sidebar = qs("#sidebar");
  const toggle = sidebarToggle;
  if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
    closeSidebar();
  }
});

// ensure nav links hide sidebar on small screens after click
qsa("#sidebar nav a").forEach((a) => {
  a.addEventListener("click", () => {
    if (window.innerWidth < 768) closeSidebar();
  });
});

// ---------- CONTACT FORM: client-side validation ----------
const contactForm = qs("#contactForm");
const formAlert = qs("#formAlert");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // bootstrap validation classes
    if (!contactForm.checkValidity()) {
      contactForm.classList.add("was-validated");
      formAlert.classList.remove("visually-hidden");
      formAlert.classList.remove("text-success");
      formAlert.classList.add("text-danger");
      formAlert.textContent =
        "Please fix the errors in the form and try again.";
      return;
    }

    // ---------- CONTACT FORM WITH EMAILJS ----------
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const btnSend = qs("#btnSend");
    const btnReset = qs("#btnReset");

    if (!contactForm.checkValidity()) {
      contactForm.classList.add("was-validated");
      formAlert.classList.remove("visually-hidden", "text-success");
      formAlert.classList.add("text-danger");
      formAlert.textContent =
        "Please fix the errors in the form and try again.";
      return;
    }

    // Disable both buttons AFTER validation
    btnSend.disabled = true;
    btnReset.disabled = true;
    btnSend.textContent = "Sending...";

    // Prepare EmailJS parameters
const params = {
  to_name: "Fares",
  from_name: qs('#inputName').value.trim(),
  from_email: qs('#inputEmail').value.trim(),
  message: qs('#inputMessage').value.trim(),
  phone: qs('#inputPhone') ? qs('#inputPhone').value.trim() : '',
  subject: "Website contact form message",
};

    emailjs
      .send("service_c1g4pv3", "template_p28tgwi", params)
      .then(() => {
        contactForm.reset();
        contactForm.classList.remove("was-validated");

        formAlert.classList.remove("visually-hidden", "text-danger");
        formAlert.classList.add("text-success");
        formAlert.textContent = "Your message has been sent successfully!";

        // Re-enable buttons
        btnSend.disabled = false;
        btnReset.disabled = false;
        btnSend.textContent = "Send message";

        setTimeout(() => formAlert.classList.add("visually-hidden"), 6000);
      })
      .catch(() => {
        formAlert.classList.remove("visually-hidden", "text-success");
        formAlert.classList.add("text-danger");
        formAlert.textContent =
          "There was an error sending your message. Please try again later.";

        // Re-enable even on error
        btnSend.disabled = false;
        btnReset.disabled = false;
        btnSend.textContent = "Send message";
      });
  });
}

    // set timeout to hide success after a while
    setTimeout(() => {
      formAlert.classList.add("visually-hidden");
    }, 6000);
  });
}

// ---------- Small accessibility enhancement: skip to main on load when hash present ----------
if (location.hash) {
  const target = qs(location.hash);
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus();
  }
}

// ---------- keyboard arrow navigation for project cards (improves keyboard UX) ----------
qsa(".project-card").forEach((card) => {
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // find first link and follow it
      const link = card.querySelector("a");
      if (link) link.click();
    }
  });
});
