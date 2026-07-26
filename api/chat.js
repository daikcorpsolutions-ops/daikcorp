module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mensagem, historico } = req.body;

  if (!mensagem || typeof mensagem !== 'string') {
    return res.status(400).json({ error: 'Mensagem é obrigatória' });
  }

  // Instrução fixa que ensina a IA sobre a empresa
  const instrucaoSistema = `
Você é o assistente virtual da DAIK CORP, uma empresa de tecnologia que atua com:
- Desenvolvimento Web (sites e sistemas)
- Sistema de Ponto Digital (registro de funcionários com GPS e foto)
- Aplicativos Mobile
- Segurança Privada e Monitoramento Inteligente
- Automação Empresarial e Inteligência Artificial
- Infraestrutura de TI e Consultoria Tecnológica

Responda sempre em português do Brasil, de forma curta, simpática e objetiva
(no máximo 3-4 frases por resposta). Seu objetivo é tirar dúvidas rápidas sobre
os serviços e incentivar a pessoa a preencher o formulário de orçamento
(disponível em "orcamento.html") ou falar no WhatsApp da empresa quando fizer
sentido. Se perguntarem algo totalmente fora do escopo da empresa, redirecione
educadamente de volta para os serviços da DAIK CORP. Nunca invente preços
exatos — diga que o valor depende do projeto e que o ideal é solicitar um
orçamento personalizado.
`.trim();

  // Monta o histórico da conversa no formato que o Gemini espera
  const conteudos = [
    ...(Array.isArray(historico) ? historico : []).map((h) => ({
      role: h.autor === 'usuario' ? 'user' : 'model',
      parts: [{ text: h.texto }],
    })),
    { role: 'user', parts: [{ text: mensagem }] },
  ];

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: conteudos,
          systemInstruction: { parts: [{ text: instrucaoSistema }] },
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    if (geminiRes.status === 429) {
      return res.status(429).json({
        error: 'limite_atingido',
        mensagem: 'Estou com bastante gente conversando agora. Que tal falar direto no nosso WhatsApp?',
      });
    }

    if (!geminiRes.ok) {
      const erro = await geminiRes.text();
      return res.status(500).json({ error: 'Erro ao consultar IA', detalhe: erro });
    }

    const data = await geminiRes.json();
    const resposta =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui entender. Pode reformular sua pergunta?';

    return res.status(200).json({ resposta });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', detalhe: err.message });
  }
}