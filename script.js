(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  const themeBtn = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const THEME_COLORS = { dark: "#0A0F1A", light: "#F5F6F9" };

  const applyTheme = (theme, persist) => {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLORS[theme]);
    if (themeBtn) themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
    }
  };

  applyTheme(root.getAttribute("data-theme") || "dark", false);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menu-toggle");
  const navLinksWrap = document.getElementById("nav-links");

  const setMenu = (open) => {
    if (!menuBtn || !navLinksWrap) return;
    navLinksWrap.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (menuBtn && navLinksWrap) {
    menuBtn.addEventListener("click", () => setMenu(!navLinksWrap.classList.contains("open")));
    navLinksWrap.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 820) setMenu(false); });
  }

  /* ---------- Scroll progress ---------- */
  const progress = document.querySelector(".scroll-progress span");
  const updateProgress = () => {
    if (!progress) return;
    const max = root.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progress.style.width = pct + "%";
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* ---------- Active nav link ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- Hero: rotating typed phrase ---------- */
  const typed = document.getElementById("typed");
  if (typed && !reduceMotion) {
    const words = ["backend services", "REST APIs", "web applications", "maintainable software"];
    let w = 0, i = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let delay = deleting ? 40 : 75;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    };
    typed.textContent = "";
    setTimeout(tick, 500);
  }

  /* ---------- Project filter ---------- */
  const chips = document.querySelectorAll(".chip[data-filter]");
  const projects = document.querySelectorAll(".project[data-cat]");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      projects.forEach((p) => {
        const match = filter === "all" || p.dataset.cat.split(" ").includes(filter);
        p.hidden = !match;
      });
    });
  });

  /* ---------- Copy email ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = "prathisdeo@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        showToast("Email address copied");
      } catch (e) {
        window.location.href = "mailto:" + email;
      }
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();