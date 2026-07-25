async function finalizar() {
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

  // Salva localmente (mantém a consulta de andamento funcionando)
  const lista = JSON.parse(localStorage.getItem("daik_orcamentos") || "[]");
  lista.push(pedido);
  localStorage.setItem("daik_orcamentos", JSON.stringify(lista));

  // Mostra a tela de sucesso já (não trava esperando o email)
  document.getElementById("orc-codigo").textContent = pedido.codigo;
  document.getElementById("wizard").hidden = true;
  document.getElementById("sucesso").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Envia o email pra empresa em segundo plano enviado
  try {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });
  } catch (err) {
    console.error("Erro ao notificar por email:", err);
    // não interrompe o fluxo do usuário — ele já viu o código de sucesso
  }
}