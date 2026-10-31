const headerHost = document.querySelector("[data-site-header]");
const footerHost = document.querySelector("[data-site-footer]");

async function loadPartial(host, path) {
  if (!host) return;
  const response = await fetch(new URL(path, document.baseURI));
  if (!response.ok) {
    throw new Error(`Could not load ${path}: ${response.status} ${response.statusText}`);
  }
  host.innerHTML = await response.text();
}

function initNavigation() {
  const page = document.body.dataset.page;
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("#main-navigation");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !nav || !toggle) return;

  nav.querySelectorAll("[data-nav-page]").forEach((link) => {
    if (link.dataset.navPage === page) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  function closeMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

async function initCyberChat() {
  try {
    const { initCyberChatWidget } = await import("./cyber-chat.js");
    initCyberChatWidget();
  } catch (error) {
    console.error("CyberSaathi help chat could not be initialized.", error);
  }
}

async function initAuthentication() {
  const forms = [...document.querySelectorAll("[data-auth-form]")];
  if (!forms.length) return;
  try {
    const { initAuth } = await import("./auth.js");
    window.cyberSaathiAuthState = initAuth({ forms });
    window.cyberSaathiAuthState.setOnUserChange((user) => {
      window.dispatchEvent(new CustomEvent("cybersaathi-auth-state", { detail: { user } }));
    });
  } catch (error) {
    console.error("Firebase authentication could not be initialized.", error);
    document.querySelectorAll("[data-auth-status]").forEach((status) => {
      status.textContent = "Authentication is unavailable. Check your connection and Firebase configuration.";
      status.classList.add("auth-status-error");
    });
    forms.forEach((form) => form.addEventListener("submit", (event) => event.preventDefault()));
  }
}

try {
  await Promise.all([
    loadPartial(headerHost, "./partials/header.html"),
    loadPartial(footerHost, "./partials/footer.html"),
  ]);
  initNavigation();
  initCyberChat();
  initAuthentication();
} catch (error) {
  console.error("CyberSaathi shared navigation or footer could not be loaded.", error);
  document.querySelectorAll("[data-site-header], [data-site-footer]").forEach((host) => {
    host.textContent = "Some shared page content could not be loaded. Refresh the page or check that you are using a local web server.";
  });
}
