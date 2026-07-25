/* Preloader */
const preloader = document.getElementById("preloader");
if (preloader) {
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("done"), 450);
  });
  setTimeout(() => preloader.classList.add("done"), 4000);
}

/* contadores dos KPIs do mockup */
const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function animaKpi(el) {
  const alvo = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  if (reduz) { el.textContent = prefix + alvo + suffix; return; }
  const inicio = performance.now();
  (function tick(agora) {
    const t = Math.min((agora - inicio) / 1500, 1);
    const val = Math.round(alvo * (1 - Math.pow(1 - t, 3)));
    el.textContent = prefix + val + suffix;
    if (t < 1) requestAnimationFrame(tick);
  })(inicio);
}
document.querySelectorAll(".kpi-num[data-count]").forEach(animaKpi);

/* KPIs vivos: pequenas variações a cada 3s, como dado chegando */
if (!reduz) {
  const kpis = [...document.querySelectorAll(".kpi-num[data-count]")];
  const bases = kpis.map((el) => +el.dataset.count);
  setInterval(() => {
    kpis.forEach((el, i) => {
      const base = bases[i];
      const variacao = Math.round((Math.random() - 0.4) * base * 0.03);
      const novo = Math.max(0, base + variacao);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      el.textContent = prefix + novo + suffix;
    });
  }, 3000);
}

/* reveal */
const obs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));