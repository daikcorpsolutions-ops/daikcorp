export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    codigo, nome, empresa, whatsapp, email, descricao,
    servicos, detalhes, porte, prazo, investimento,
  } = req.body;

  if (!nome || !whatsapp) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DAIK CORP <onboarding@resend.dev>',
        to: ['daikcorpsolutions@gmail.com'],
        subject: `Novo orçamento: ${nome} (${codigo})`,
        html: `
          <h2>Novo pedido de orçamento</h2>
          <p><strong>Código:</strong> ${codigo}</p>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Empresa:</strong> ${empresa || 'não informado'}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p><strong>E-mail:</strong> ${email || 'não informado'}</p>
          <hr />
          <p><strong>Serviços:</strong> ${(servicos || []).join(', ') || '-'}</p>
          <p><strong>Detalhes:</strong> ${(detalhes || []).join(', ') || '-'}</p>
          <p><strong>Porte:</strong> ${porte || '-'}</p>
          <p><strong>Prazo:</strong> ${prazo || '-'}</p>
          <p><strong>Investimento:</strong> ${investimento || '-'}</p>
          <hr />
          <p><strong>Descrição:</strong></p>
          <p>${descricao || 'sem detalhes adicionais'}</p>
        `,
      }),
    });

    if (!resendRes.ok) {
      const erro = await resendRes.text();
      return res.status(500).json({ error: 'Erro ao enviar email', detalhe: erro });
    }

    return res.status(200).json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', detalhe: err.message });
  }
}