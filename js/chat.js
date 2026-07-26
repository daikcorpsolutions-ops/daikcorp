const chatToggle = document.getElementById("chat-toggle");
const chatJanela = document.getElementById("chat-janela");
const chatMensagens = document.getElementById("chat-mensagens");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatDica = document.getElementById("chat-dica");

/* mostra a bolha "Fale comigo" uma vez por visita, depois de 3s */
if (!sessionStorage.getItem("daik_chat_dica_vista")) {
  setTimeout(() => {
    if (chatJanela.hidden) {
      chatDica.classList.add("visivel");
      setTimeout(() => chatDica.classList.remove("visivel"), 6000);
    }
  }, 3000);
  sessionStorage.setItem("daik_chat_dica_vista", "1");
}

let historico = [];
let carregando = false;

chatToggle.addEventListener("click", () => {
  chatDica.classList.remove("visivel");
  const abrindo = chatJanela.hidden;
  chatJanela.hidden = !abrindo;
  requestAnimationFrame(() => {
    chatJanela.classList.toggle("aberta", abrindo);
    chatToggle.classList.toggle("aberto", abrindo);
  });
  if (abrindo) chatInput.focus();
});

function adicionarMensagem(texto, autor) {
  const div = document.createElement("div");
  div.className = `chat-msg chat-msg-${autor === "usuario" ? "user" : "bot"}`;
  div.textContent = texto;
  chatMensagens.appendChild(div);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function mostrarDigitando() {
  const div = document.createElement("div");
  div.className = "chat-msg chat-msg-bot chat-msg-digitando";
  div.id = "chat-digitando";
  div.innerHTML = "<span></span><span></span><span></span>";
  chatMensagens.appendChild(div);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function removerDigitando() {
  document.getElementById("chat-digitando")?.remove();
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto || carregando) return;

  adicionarMensagem(texto, "usuario");
  historico.push({ autor: "usuario", texto });
  chatInput.value = "";
  carregando = true;
  mostrarDigitando();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: texto, historico }),
    });
    const data = await res.json();
    removerDigitando();

    if (res.status === 429) {
      adicionarMensagem(data.mensagem, "bot");
    } else if (data.resposta) {
      adicionarMensagem(data.resposta, "bot");
      historico.push({ autor: "bot", texto: data.resposta });
    } else {
      adicionarMensagem("Desculpe, tive um probleminha. Tente novamente em instantes.", "bot");
    }
  } catch (err) {
    removerDigitando();
    adicionarMensagem("Não consegui me conectar agora. Que tal falar direto no nosso WhatsApp? 💬", "bot");
  } finally {
    carregando = false;
  }
});