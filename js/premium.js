/* Preloader */
const preloader = document.getElementById("preloader");
if (preloader) {
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("done"), 450);
  });
  setTimeout(() => preloader.classList.add("done"), 4000);
}

/* reveal */
const obs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));