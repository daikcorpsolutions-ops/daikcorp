/* ============================================================
   DAIK CORP — Orçamento Interativo
   Wizard de 4 passos · Resumo ao vivo · Código de protocolo
   · Consulta de andamento (local, preparado para o backend)
   ============================================================ */

const TOTAL_PASSOS = 4;
let passoAtual = 1;

const dados = {
  servicos: [],
  detalhes: [],
  prazo: [],
  porte: "Ainda não sei",
  investimento: "Prefiro não informar",
};

const panes = [...document.querySelectorAll(".orc-pane")];
const stepDots = [...document.querySelectorAll(".orc-step-dot")];
const btnVoltar = document.getElementById("orc-voltar");
const btnAvancar = document.getElementById("orc-avancar");
const erroEl = document.getElementById("orc-erro");
const resumoEl = document.getElementById("resumo-conteudo");

/* ---------- SELEÇÃO DE OPÇÕES ---------- */
document.querySelectorAll(".orc-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const grupo = btn.dataset.group;
    const valor = btn.dataset.value;
    const unico = btn.hasAttribute("data-single");

    if (unico) {
      document
        .querySelectorAll(`.orc-opt[data-group="${grupo}"]`)
        .forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      dados[grupo] = [valor];
    } else {
      btn.classList.toggle("on");
      if (btn.classList.contains("on")) {
        dados[grupo].push(valor);
      } else {
        dados[grupo] = dados[grupo].filter((v) => v !== valor);
      }
    }
    erroEl.textContent = "";
    montarResumo();
  });
});

document.getElementById("porte").addEventListener("change", (e) => {
  dados.porte = e.target.value;
  montarResumo();
});
document.getElementById("investimento").addEventListener("change", (e) => {
  dados.investimento = e.target.value;
  montarResumo();
});

/* ---------- RESUMO AO VIVO ---------- */
function montarResumo() {
  const blocos = [];

  if (dados.servicos.length) {
    blocos.push(`<div class="orc-resumo-bloco"><h4>Serviços</h4><p>${dados.servicos.join(" · ")}</p></div>`);
  }
  if (dados.detalhes.length || dados.porte !== "Ainda não sei") {
    const extras = [...dados.detalhes];
    if (dados.porte !== "Ainda não sei") extras.push(`Porte: ${dados.porte}`);
    blocos.push(`<div class="orc-resumo-bloco"><h4>Detalhes</h4><p>${extras.join(" · ")}</p></div>`);
  }
  if (dados.prazo.length || dados.investimento !== "Prefiro não informar") {
    const extras = [...dados.prazo];
    if (dados.investimento !== "Prefiro não informar") extras.push(dados.investimento);
    blocos.push(`<div class="orc-resumo-bloco"><h4>Prazo & investimento</h4><p>${extras.join(" · ")}</p></div>`);
  }

  resumoEl.innerHTML = blocos.length
    ? blocos.join("")
    : '<p class="orc-resumo-vazio">Suas escolhas aparecem aqui conforme você avança.</p>';
}

/* ---------- NAVEGAÇÃO ENTRE PASSOS ---------- */
function validarPasso(passo) {
  if (passo === 1 && dados.servicos.length === 0) {
    return "Escolha pelo menos um serviço pra continuar.";
  }
  if (passo === 4) {
    const nome = document.getElementById("orc-nome").value.trim();
    const whats = document.getElementById("orc-whats").value.trim();
    if (!nome || !whats) return "Preencha pelo menos nome e WhatsApp.";
  }
  return null;
}

function mostrarPasso(passo) {
  passoAtual = passo;
  panes.forEach((p) => p.classList.toggle("active", +p.dataset.pane === passo));
  stepDots.forEach((d) => {
    const n = +d.dataset.step;
    d.classList.toggle("active", n === passo);
    d.classList.toggle("done", n < passo);
  });
  btnVoltar.disabled = passo === 1;
  btnAvancar.textContent = passo === TOTAL_PASSOS ? "Finalizar ✓" : "Avançar →";
  erroEl.textContent = "";
}

btnVoltar.addEventListener("click", () => {
  if (passoAtual > 1) mostrarPasso(passoAtual - 1);
});

btnAvancar.addEventListener("click", () => {
  const erro = validarPasso(passoAtual);
  if (erro) {
    erroEl.textContent = erro;
    return;
  }
  if (passoAtual < TOTAL_PASSOS) {
    mostrarPasso(passoAtual + 1);
  } else {
    finalizar();
  }
});

/* ---------- FINALIZAÇÃO + CÓDIGO DE PROTOCOLO ---------- */
function gerarCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem caracteres ambíguos
  let sufixo = "";
  for (let i = 0; i < 4; i++) {
    sufixo += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DAIK-${new Date().getFullYear()}-${sufixo}`;
}

function finalizar() {
  const pedido = {
    codigo: gerarCodigo(),
    data: new Date().toLocaleString("pt-BR"),
    status: "Recebido — em análise",
    servicos: dados.servicos,
    detalhes: dados.detalhes,
    porte: dados.porte,
    prazo: dados.prazo[0] || "Não informado",
    investimento: dados.investimento,
    nome: document.getElementById("orc-nome").value.trim(),
    empresa: document.getElementById("orc-empresa").value.trim(),
    whatsapp: document.getElementById("orc-whats").value.trim(),
    email: document.getElementById("orc-email").value.trim(),
    descricao: document.getElementById("orc-desc").value.trim(),
  };

  // Por enquanto salva neste navegador. Quando o backend entrar,
  // este bloco vira: await fetch("/api/orcamentos", { method: "POST", ... })
  const lista = JSON.parse(localStorage.getItem("daik_orcamentos") || "[]");
  lista.push(pedido);
  localStorage.setItem("daik_orcamentos", JSON.stringify(lista));

  document.getElementById("orc-codigo").textContent = pedido.codigo;
  document.getElementById("wizard").hidden = true;
  document.getElementById("sucesso").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("copiar-codigo").addEventListener("click", () => {
  const codigo = document.getElementById("orc-codigo").textContent;
  navigator.clipboard.writeText(codigo).then(() => {
    document.getElementById("copiar-codigo").textContent = "Copiado! ✓";
    setTimeout(() => {
      document.getElementById("copiar-codigo").textContent = "Copiar código";
    }, 2000);
  });
});

/* ---------- CONSULTA DE ANDAMENTO ---------- */
document.getElementById("consulta-btn").addEventListener("click", () => {
  const codigo = document.getElementById("consulta-codigo").value.trim().toUpperCase();
  const res = document.getElementById("consulta-res");

  if (!codigo) {
    res.textContent = "Digite o código do seu orçamento.";
    return;
  }

  const lista = JSON.parse(localStorage.getItem("daik_orcamentos") || "[]");
  const pedido = lista.find((p) => p.codigo === codigo);

  if (pedido) {
    res.innerHTML = `<strong>${pedido.codigo}</strong> · ${pedido.data}<br />
      Status: <span class="orc-status">${pedido.status}</span><br />
      Serviços: ${pedido.servicos.join(", ")}`;
  } else {
    res.textContent =
      "Código não encontrado neste dispositivo. A consulta online (de qualquer aparelho) entra no ar junto com o nosso sistema.";
  }
});

document.getElementById("consulta-codigo").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("consulta-btn").click();
});