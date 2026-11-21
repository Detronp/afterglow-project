const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

// Glowing blob follows the cursor
const blob = document.querySelector(".blob");
addEventListener("pointermove", (e) => {
  blob.style.setProperty("--x", `${e.clientX}px`);
  blob.style.setProperty("--y", `${e.clientY}px`);
});

// Scroll reveal, staggered within each section
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll(":scope > .reveal")];
    entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 70}ms`;
    entry.target.classList.add("in");
    io.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Countdown
const cd = document.querySelector(".countdown");
if (cd) {
  const target = new Date(cd.dataset.target).getTime();
  const units = Object.fromEntries([...cd.querySelectorAll("b")].map((b) => [b.dataset.u, b]));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    units.d.textContent = d; units.h.textContent = pad(h);
    units.m.textContent = pad(m); units.s.textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);
}

if (!reduced && finePointer) {
  // 3D tilt and a spotlight that follows the cursor on lineup cards
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
      card.style.transform = `perspective(800px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg)`;
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });

  // Buttons that lean toward the cursor
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    });
    btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
  });
}
