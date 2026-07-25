/* Preloader — some quando a página termina de carregar */
const preloader = document.getElementById("preloader");
if (preloader) {
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("done"), 450);
  });
  setTimeout(() => preloader.classList.add("done"), 4000); // trava de segurança
}

/* Ponto Digital — relógio ao vivo do mockup */
const relogioEl = document.getElementById("pts-relogio");
const dataEl = document.getElementById("pts-data");

if (relogioEl) {
  function atualizaRelogio() {
    const agora = new Date();
    relogioEl.textContent = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    if (dataEl) {
      dataEl.textContent = agora.toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long",
      });
    }
  }
  atualizaRelogio();
  setInterval(atualizaRelogio, 1000);
}

/* reveal simples */
const obs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));