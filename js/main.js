// Amber & Oak Café: shared behaviour. Plain JS, no libraries.
document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Split [data-split] headings into words for the word-by-word reveal
document.querySelectorAll("[data-split]").forEach((el) => {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement("span");
          w.className = "word";
          const inner = document.createElement("span");
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  el.querySelectorAll(".word > span").forEach((s, i) => s.style.setProperty("--d", `${0.15 + i * 0.06}s`));
});

// Stagger delays for children of [data-stagger]
document.querySelectorAll("[data-stagger]").forEach((group) => {
  const step = parseFloat(group.dataset.stagger) || 0.12;
  group.querySelectorAll(":scope > [data-reveal]").forEach((el, i) => el.style.setProperty("--d", `${i * step}s`));
});

// Reveal on scroll. Uses bounding rects, not IntersectionObserver: Chrome
// applies a target's own clip-path when computing intersection, so a fully
// clipped [data-reveal="clip"] photo never counted as visible and stayed
// blank forever.
const revealables = [...document.querySelectorAll("[data-reveal], [data-split]")];
let pendingReveals = reduceMotion ? [] : revealables;
if (reduceMotion) revealables.forEach((el) => el.classList.add("is-visible"));
function checkReveals() {
  if (!pendingReveals.length) return;
  const trigger = window.innerHeight * 0.9;
  pendingReveals = pendingReveals.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.top < trigger && r.bottom > 0) {
      el.classList.add("is-visible");
      return false;
    }
    return true;
  });
}
checkReveals();

// Hero intro: start the photo entrance once the first frame has painted
const heroEl = document.querySelector(".hero");
// Hero text and buttons reveal on load, not on scroll: on short screens the
// buttons sit below the 90% scroll trigger and would stay hidden.
if (heroEl) requestAnimationFrame(() => requestAnimationFrame(() => {
  heroEl.classList.add("is-loaded");
  heroEl.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
}));

// Hero cup: a gentle 3D tilt (and bean drift) that follows the mouse.
// CSS reads --mx / --my (-1..1); touch devices and reduced motion skip it.
const heroFigure = document.querySelector(".hero-figure");
if (heroEl && heroFigure && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  heroEl.addEventListener("pointermove", (e) => {
    const r = heroEl.getBoundingClientRect();
    heroFigure.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    heroFigure.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  });
  heroEl.addEventListener("pointerleave", () => {
    heroFigure.style.setProperty("--mx", "0");
    heroFigure.style.setProperty("--my", "0");
  });
}

// Live "open now" status in the hero. Hours match the contact page.
const statusEl = document.getElementById("open-status");
if (statusEl) {
  const hours = [[8, 18], [7, 20], [7, 20], [7, 20], [7, 20], [7, 20], [8, 20]]; // index 0 = Sunday
  const now = new Date();
  const day = now.getDay();
  const [open, close] = hours[day];
  const h = now.getHours() + now.getMinutes() / 60;
  const fmt = (x) => `${x % 12 || 12} ${x < 12 ? "am" : "pm"}`;
  const isOpen = h >= open && h < close;
  statusEl.classList.toggle("is-open", isOpen);
  statusEl.querySelector(".status-text").textContent = isOpen
    ? `Open now, until ${fmt(close)}`
    : h < open
      ? `Closed, opens at ${fmt(open)}`
      : `Closed, opens tomorrow at ${fmt(hours[(day + 1) % 7][0])}`;
}

// "A day at Amber & Oak": pin the section and pan the row sideways on large
// screens. Touch, small screens and reduced motion keep the scroll-snap row.
const daySection = document.querySelector(".day");
const dayTrack = daySection?.querySelector(".day-track");
const dayBar = daySection?.querySelector(".day-progress span");
let panDistance = 0;
function setupDay() {
  if (!daySection || !dayTrack) return;
  const pin = !reduceMotion && window.innerWidth >= 900 && window.innerHeight >= 640;
  daySection.classList.toggle("is-pinned", pin);
  if (!pin) {
    daySection.style.height = "";
    dayTrack.style.transform = "";
    panDistance = 0;
    return;
  }
  panDistance = Math.max(0, dayTrack.scrollWidth - window.innerWidth);
  daySection.style.height = `${panDistance + window.innerHeight}px`;
}
function updateDay() {
  if (!panDistance) return;
  const r = daySection.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / panDistance));
  dayTrack.style.transform = `translate3d(${(-p * panDistance).toFixed(1)}px, 0, 0)`;
  if (dayBar) dayBar.style.setProperty("--p", p.toFixed(3));
}
setupDay();

// Scroll-linked effects: header state, progress bar, parallax, timeline fill
const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress");
const parallax = [...document.querySelectorAll("[data-speed]")];
// Hero cup and beans: lift away as you scroll, each at its own rate (depth).
// Based on scrollY so nothing shifts at load, unlike [data-speed].
const lifters = [...document.querySelectorAll("[data-lift]")];
const timeline = document.querySelector(".timeline");
const timelineFill = document.querySelector(".timeline-fill");

let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  if (header) header.classList.toggle("scrolled", y > 24);
  if (progress) {
    const max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }
  if (!reduceMotion) {
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    if (y < vh * 1.5) {
      lifters.forEach((el) => {
        const lift = parseFloat(el.dataset.lift);
        el.style.transform = `translate3d(0, ${(-y * lift).toFixed(1)}px, 0) rotate(${(y * lift * 0.03).toFixed(2)}deg)`;
      });
    }
  }
  checkReveals();
  updateDay();
  if (timeline && timelineFill) {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
    timelineFill.style.setProperty("--p", p.toFixed(3));
  }
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
window.addEventListener("resize", () => { setupDay(); onScroll(); });
onScroll();

// Menu tabs (menu page)
const tabs = document.querySelectorAll(".menu-tab");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.target;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    document.querySelectorAll(".menu-panel").forEach((p) => {
      const show = target === "all" || p.id === target;
      p.hidden = !show;
      if (show) {
        p.classList.remove("is-entering");
        void p.offsetWidth; // restart the animation
        p.classList.add("is-entering");
        p.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      }
    });
  });
});

// Contact form: validates client-side (no backend yet)
const form = document.getElementById("contact-form");
if (form) {
  const rules = {
    name: (v) => v.trim().length >= 2 || "Please enter your name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Please enter a valid email.",
    message: (v) => v.trim().length >= 10 || "Message should be at least 10 characters.",
  };
  const success = form.querySelector(".form-success");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    Object.entries(rules).forEach(([name, check]) => {
      const input = form.elements[name];
      const field = input.closest(".field");
      const result = check(input.value);
      const err = field.querySelector(".error");
      if (result === true) {
        field.classList.remove("invalid");
        err.textContent = "";
      } else {
        ok = false;
        field.classList.add("invalid");
        err.textContent = result;
      }
    });
    if (!ok) {
      form.querySelector(".invalid input, .invalid textarea")?.focus();
      success.classList.remove("show");
      return;
    }
    form.reset();
    success.classList.add("show");
  });
}
