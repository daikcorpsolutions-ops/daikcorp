/* ============================================================
   DAIK CORP — Interações
   1. Preloader
   2. Barra de progresso
   3. Partículas vermelhas de fundo
   4. Mão de partículas (hero)
   5. Globo de pontos (sobre)
   6. Cursor personalizado
   7. Tilt 3D · Reveal · Contadores
   8. Parallax suave
   9. Header, nav ativa, menu mobile e formulário
   ============================================================ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. PRELOADER ---------- */
const preloader = document.getElementById("preloader");
window.addEventListener("load", () => {
  setTimeout(() => preloader.classList.add("done"), reduceMotion ? 0 : 500);
});
setTimeout(() => preloader.classList.add("done"), 4000); // trava de segurança

/* ---------- 2. BARRA DE PROGRESSO ---------- */
const progress = document.getElementById("progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
}

/* ---------- 3. PARTÍCULAS DE FUNDO ---------- */
const pCanvas = document.getElementById("particles");
if (pCanvas && !reduceMotion) {
  const pctx = pCanvas.getContext("2d");
  let parts = [];
  const pMouse = { x: -9999, y: -9999 };
  let pSkip = false;

  window.addEventListener("mousemove", (e) => {
    pMouse.x = e.clientX;
    pMouse.y = e.clientY;
  });
  document.addEventListener("mouseleave", () => {
    pMouse.x = -9999;
    pMouse.y = -9999;
  });

  function resizeParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }

  function initParticles() {
    parts = [];
    const qtd = Math.min(34, Math.floor(window.innerWidth / 38));
    for (let i = 0; i < qtd; i++) {
      parts.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        r: 0.6 + Math.random() * 1.6,
        vy: 0.15 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.15,
        a: 0.08 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function renderParticles(now) {
    // roda a 30fps: imperceptível no fundo, metade do custo
    pSkip = !pSkip;
    if (pSkip) { requestAnimationFrame(renderParticles); return; }
    const t = now * 0.001;
    pctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    // move e desenha os pontos
    for (const p of parts) {
      p.y -= p.vy;
      p.x += p.vx + Math.sin(t + p.phase) * 0.1;
      if (p.y < -10) { p.y = pCanvas.height + 10; p.x = Math.random() * pCanvas.width; }
      if (p.x < -10) p.x = pCanvas.width + 10;
      if (p.x > pCanvas.width + 10) p.x = -10;

      const tw = p.a * (0.7 + Math.sin(t * 2 + p.phase) * 0.3);
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(255, 43, 43, ${tw})`;
      pctx.fill();
    }

    // REDE NEURAL: conecta pontos próximos entre si...
    for (let i = 0; i < parts.length; i++) {
      const a = parts[i];
      for (let j = i + 1; j < parts.length; j++) {
        const b = parts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          pctx.beginPath();
          pctx.moveTo(a.x, a.y);
          pctx.lineTo(b.x, b.y);
          pctx.strokeStyle = `rgba(255, 43, 43, ${(1 - d / 110) * 0.12})`;
          pctx.lineWidth = 0.5;
          pctx.stroke();
        }
      }

      // ...e ao mouse, formando a teia interativa
      const dm = Math.hypot(a.x - pMouse.x, a.y - pMouse.y);
      if (dm < 160) {
        pctx.beginPath();
        pctx.moveTo(a.x, a.y);
        pctx.lineTo(pMouse.x, pMouse.y);
        pctx.strokeStyle = `rgba(255, 43, 43, ${(1 - dm / 160) * 0.35})`;
        pctx.lineWidth = 0.6;
        pctx.stroke();
      }
    }

    requestAnimationFrame(renderParticles);
  }

  resizeParticles();
  initParticles();
  requestAnimationFrame(renderParticles);
  window.addEventListener("resize", () => { resizeParticles(); initParticles(); });
}

/* ---------- 5. GLOBO DE PONTOS (SOBRE) ---------- */
const canvas = document.getElementById("globe");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let dots = [];
  let angleY = 0, angleX = 0.35, targetX = 0.35;
  const DOTS = 320;

  function initGlobe() {
    dots = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      dots.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }
  }

  function resizeGlobe() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let globeVisivel = true;
  new IntersectionObserver(
    (e) => { globeVisivel = e[0].isIntersecting; },
    { rootMargin: "100px" }
  ).observe(canvas);

  function renderGlobe() {
    if (!globeVisivel) { requestAnimationFrame(renderGlobe); return; }
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width, ch = rect.height;
    if (cw > 0) {
      const scale = Math.min(cw, ch) * 0.38;
      const cx = cw / 2, cy = ch / 2;

      ctx.clearRect(0, 0, cw, ch);

      angleY += reduceMotion ? 0 : 0.0035;
      angleX += (targetX - angleX) * 0.05;

      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

      for (const d of dots) {
        let x = d.x * cosY - d.z * sinY;
        let z = d.x * sinY + d.z * cosY;
        let y = d.y * cosX - z * sinX;
        z = d.y * sinX + z * cosX;

        const depth = (z + 1.6) / 2.6;
        const g = Math.round(115 - 75 * depth);
        ctx.beginPath();
        ctx.arc(cx + x * scale, cy + y * scale, 0.6 + depth * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${g}, ${g}, ${0.08 + depth * 0.8})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.ellipse(cx, cy, scale * 1.25, scale * 0.34, -0.35, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 43, 43, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    requestAnimationFrame(renderGlobe);
  }

  window.addEventListener("mousemove", (e) => {
    if (reduceMotion) return;
    targetX = 0.35 + (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  window.addEventListener("load", () => {
    initGlobe();
    resizeGlobe();
    renderGlobe();
  });
  window.addEventListener("resize", () => {
    clearTimeout(window.__globeResize);
    window.__globeResize = setTimeout(resizeGlobe, 150);
  });
}

/* ---------- 6. CURSOR PERSONALIZADO ---------- */
const finePointer = window.matchMedia("(pointer: fine)").matches;

if (finePointer && !reduceMotion) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.body.classList.add("cursor-active");
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  (function followRing() {
    ringX += (mouseX - ringX) * 0.28;
    ringY += (mouseY - ringY) * 0.28;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(followRing);
  })();

  const clickables = "a, button, input, textarea, [data-tilt]";
  document.querySelectorAll(clickables).forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
}

/* ---------- 7. TILT 3D · REVEAL · CONTADORES ---------- */
document.querySelectorAll("[data-tilt]").forEach((card) => {
  if (reduceMotion) return;
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateZ(6px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

function animateCount(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) { el.textContent = target + suffix; return; }
  const duration = 1400;
  const start = performance.now();
  (function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  })(start);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------- 8. PARALLAX (integrado no loop de scroll) ---------- */
const heroVisual = document.querySelector(".hero-visual");
const globeEl = document.getElementById("globe");

/* ---------- 9. HEADER, NAV ATIVA, MENU E FORM ---------- */
const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const toggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".nav-pill a")];

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function updateActiveNav() {
  const pos = window.scrollY + window.innerHeight * 0.35;
  let current = sections[0];
  for (const s of sections) {
    if (s.offsetTop <= pos) current = s;
  }
  navLinks.forEach((a) =>
    a.classList.toggle("active", a.getAttribute("href") === "#" + current.id)
  );
}

const form = document.getElementById("form-contato");
const status = document.querySelector(".form-status");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  // Quando o backend estiver pronto, substitua por um fetch():
  // await fetch("/api/contato", { method: "POST", body: new FormData(form) })
  window.location.href = "obrigado.html";
});

/* ---------- LOOP DE SCROLL (leituras antes de escritas) ---------- */
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      // === LEITURAS (medições da página) ===
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const navPos = y + vh * 0.35;
      let current = sections[0];
      for (const s of sections) {
        if (s.offsetTop <= navPos) current = s;
      }
      const heroAtivo = !reduceMotion && heroVisual && y < vh * 1.3;
      const globeRect =
        !reduceMotion && globeEl && globeEl.offsetParent
          ? globeEl.parentElement.getBoundingClientRect()
          : null;

      // === ESCRITAS (alterações no DOM) ===
      header.classList.toggle("scrolled", y > 40);
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === "#" + current.id)
      );
      if (heroAtivo) heroVisual.style.transform = `translateY(${y * 0.08}px)`;
      if (globeRect && globeRect.top < vh && globeRect.bottom > 0) {
        const offset = (vh - globeRect.top) * 0.05;
        globeEl.style.transform = `translateY(calc(-50% + ${offset}px))`;
      }
      updateScrub();

      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener("load", () => {
  updateProgress();
  updateActiveNav();
});


/* ============================================================
   TEXTO REVELADO NO SCROLL
   Divide a frase em palavras e acende cada uma conforme
   a seção atravessa a tela.
   ============================================================ */

const scrubEls = [...document.querySelectorAll(".scrub-text")];

scrubEls.forEach((el) => {
  const nodes = [...el.childNodes];
  el.innerHTML = "";
  nodes.forEach((node) => {
    if (node.nodeType === 3) {
      node.textContent.split(/\s+/).filter(Boolean).forEach((w) => {
        const s = document.createElement("span");
        s.className = "word";
        s.textContent = w;
        el.append(s, " ");
      });
    } else {
      node.classList.add("word");
      el.append(node, " ");
    }
  });
});

let scrubAtivo = false;
scrubEls.forEach((el) => {
  el.__words = [...el.querySelectorAll(".word")]; // cache
  new IntersectionObserver(
    (e) => { scrubAtivo = e.some((x) => x.isIntersecting); },
    { rootMargin: "200px" }
  ).observe(el);
});

function updateScrub() {
  if (!scrubAtivo) return;
  const vh = window.innerHeight;
  scrubEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const progress = Math.min(Math.max((vh * 0.85 - rect.top) / (vh * 0.55), 0), 1);
    const words = el.__words;
    const lit = Math.floor(progress * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  });
}

if (reduceMotion) {
  scrubEls.forEach((el) =>
    el.querySelectorAll(".word").forEach((w) => w.classList.add("on"))
  );
} else {
  window.addEventListener("scroll", () => requestAnimationFrame(updateScrub), { passive: true });
  window.addEventListener("load", updateScrub);
}


/* ============================================================
   TERMINAL DO PROCESSO
   Digita as etapas do projeto como comandos executados.
   Começa quando a seção entra na tela; roda uma vez.
   ============================================================ */

const termBody = document.getElementById("term-body");

if (termBody) {
  const linhas = [
    { t: '> daik.iniciar("seu-projeto")', c: "t-cmd" },
    { t: "✓ diagnóstico concluído", c: "t-ok" },
    { t: "> planejar({ escopo, prazos, arquitetura })", c: "t-cmd" },
    { t: "✓ planejamento aprovado", c: "t-ok" },
    { t: "> desenvolver() // código limpo + banco de dados", c: "t-cmd" },
    { t: "✓ build finalizada sem erros", c: "t-ok" },
    { t: '> publicar("suaempresa.com.br")', c: "t-cmd" },
    { t: "✓ projeto no ar", c: "t-ok" },
    { t: "> suporte.continuo = true", c: "t-cmd" },
    { t: "✓ acompanhando resultados...", c: "t-ok" },
  ];

  let li = 0, ch = 0, atual = null;
  const cursor = document.createElement("span");
  cursor.className = "term-cursor";
  termBody.appendChild(cursor);

  function digitar() {
    if (li >= linhas.length) return; // terminou: cursor fica piscando
    if (!atual) {
      atual = document.createElement("span");
      atual.className = linhas[li].c;
      termBody.insertBefore(atual, cursor);
    }
    const texto = linhas[li].t;
    if (ch < texto.length) {
      atual.textContent += texto[ch++];
      setTimeout(digitar, texto.startsWith(">") ? 26 : 12);
    } else {
      termBody.insertBefore(document.createTextNode("\n"), cursor);
      atual = null;
      li++;
      ch = 0;
      setTimeout(digitar, linhas[li - 1].t.startsWith(">") ? 200 : 450);
    }
  }

  if (reduceMotion) {
    linhas.forEach((l) => {
      const s = document.createElement("span");
      s.className = l.c;
      s.textContent = l.t;
      termBody.insertBefore(s, cursor);
      termBody.insertBefore(document.createTextNode("\n"), cursor);
    });
  } else {
    const obs = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        obs.disconnect();
        setTimeout(digitar, 400);
      }
    }, { threshold: 0.3 });
    obs.observe(termBody);
  }
}