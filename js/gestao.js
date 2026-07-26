/* ---------- CONEXÃO COM O SUPABASE ---------- */
const SUPABASE_URL = "https://dymnvggnliiemfxlpbmg.supabase.co";
const SUPABASE_KEY = "sb_publishable_SCaj_bX9FCc6FPn8QFXj4g_2BuZaX08";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const listaEl = document.getElementById("gestao-lista");
const statusEl = document.getElementById("gestao-status");
const buscaEl = document.getElementById("busca");
const filtroStatusEl = document.getElementById("filtro-status");
const btnAtualizar = document.getElementById("btn-atualizar");

const STATUS_OPCOES = [
  "Recebido — em análise",
  "Em atendimento",
  "Proposta enviada",
  "Fechado",
  "Cancelado",
];

let todosOrcamentos = [];

async function carregarOrcamentos() {
  statusEl.textContent = "Carregando orçamentos...";
  const { data, error } = await supabaseClient
    .from("orcamentos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    statusEl.textContent = "Erro ao carregar. Verifique a conexão ou as políticas do Supabase.";
    return;
  }

  todosOrcamentos = data;
  statusEl.textContent = `${data.length} orçamento(s) encontrado(s).`;
  renderizar();
}

function renderizar() {
  const busca = buscaEl.value.trim().toLowerCase();
  const filtroStatus = filtroStatusEl.value;

  const filtrados = todosOrcamentos.filter((o) => {
    const combinaBusca =
      !busca ||
      o.codigo.toLowerCase().includes(busca) ||
      (o.nome || "").toLowerCase().includes(busca) ||
      (o.whatsapp || "").toLowerCase().includes(busca);
    const combinaStatus = !filtroStatus || o.status === filtroStatus;
    return combinaBusca && combinaStatus;
  });

  if (filtrados.length === 0) {
    listaEl.innerHTML = '<p class="gestao-status">Nenhum orçamento encontrado com esse filtro.</p>';
    return;
  }

  listaEl.innerHTML = filtrados.map((o) => cardHTML(o)).join("");

  // liga o evento de troca de status em cada card
  listaEl.querySelectorAll("[data-status-select]").forEach((select) => {
    select.addEventListener("change", (e) => atualizarStatus(e.target));
  });
}

function cardHTML(o) {
  const data = new Date(o.created_at).toLocaleString("pt-BR");
  const opcoes = STATUS_OPCOES.map(
    (s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
  ).join("");

  return `
    <article class="orc-card glass" data-id="${o.id}">
      <div class="orc-card-topo">
        <span class="orc-card-codigo">${o.codigo}</span>
        <span class="orc-card-data">${data}</span>
      </div>
      <div class="orc-card-corpo">
        <span><strong>Nome:</strong> ${o.nome || "-"}</span>
        <span><strong>Empresa:</strong> ${o.empresa || "-"}</span>
        <span><strong>WhatsApp:</strong> ${o.whatsapp || "-"}</span>
        <span><strong>E-mail:</strong> ${o.email || "-"}</span>
        <span><strong>Serviços:</strong> ${o.servicos || "-"}</span>
        <span><strong>Prazo:</strong> ${o.prazo || "-"}</span>
        <span><strong>Porte:</strong> ${o.porte || "-"}</span>
        <span><strong>Investimento:</strong> ${o.investimento || "-"}</span>
        ${o.descricao ? `<span class="full"><strong>Descrição:</strong> ${o.descricao}</span>` : ""}
      </div>
      <div class="orc-card-rodape">
        <label style="font-size:0.78rem;color:var(--cinza)">Status:</label>
        <select data-status-select data-id="${o.id}">${opcoes}</select>
        <span class="orc-card-salvo">Salvo ✓</span>
      </div>
    </article>
  `;
}

async function atualizarStatus(select) {
  const id = select.dataset.id;
  const novoStatus = select.value;
  const aviso = select.closest(".orc-card-rodape").querySelector(".orc-card-salvo");

  const { error } = await supabaseClient
    .from("orcamentos")
    .update({ status: novoStatus })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Erro ao salvar status. Tente novamente.");
    return;
  }

  // atualiza também na lista em memória, pra não sumir ao filtrar
  const item = todosOrcamentos.find((o) => o.id === id);
  if (item) item.status = novoStatus;

  aviso.classList.add("on");
  setTimeout(() => aviso.classList.remove("on"), 1800);
}

buscaEl.addEventListener("input", renderizar);
filtroStatusEl.addEventListener("change", renderizar);
btnAtualizar.addEventListener("click", carregarOrcamentos);

carregarOrcamentos();