import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const extractLeadJson = (rawReply: string) => {
  let reply = rawReply;
  let leadData: Record<string, unknown> | null = null;

  const fencedMatch = reply.match(/```(?:json_lead|json)\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    try {
      leadData = JSON.parse(fencedMatch[1].trim());
    } catch (e) {
      console.error("Failed to parse fenced json_lead:", e);
    }
    reply = reply.replace(/```(?:json_lead|json)\s*[\s\S]*?```/gi, "").trim();
  }

  if (!leadData) {
    const fallbackMatch = reply.match(/\{[^{}]*"nome"\s*:[^{}]*(?:"converteu"|"foi_para_whatsapp")[^{}]*\}/s);
    if (fallbackMatch) {
      try {
        leadData = JSON.parse(fallbackMatch[0].trim());
        reply = reply.slice(0, fallbackMatch.index).trim();
        const afterJson = (fallbackMatch.index || 0) + fallbackMatch[0].length;
        if (afterJson < rawReply.length) {
          reply = reply.replace(fallbackMatch[0], "").trim();
        }
      } catch (e) {
        console.error("Failed to parse fallback lead JSON:", e);
      }
    }
  }

  reply = reply.replace(/\{[^{}]*"nome"\s*:[^{}]*"converteu"\s*:[^{}]*\}/gs, "").trim();

  return { reply, leadData };
};

const SYSTEM_PROMPT = `Você é Iasmin, assistente virtual da Mirage Design Studio — uma agência especializada em criação de sites que convertem visitantes em clientes.

Seu papel é conduzir uma conversa de pré-venda: entender o momento do lead, fornecer as informações certas, quebrar objeções, e ao final direcioná-lo para continuar no WhatsApp com um consultor humano.

Quando o lead não tiver interesse real, reconheça isso com naturalidade, encerre a conversa de forma positiva e registre o motivo internamente.

---

## PERSONALIDADE

- Tom: profissional, mas simpático e humano como uma consultora experiente que realmente quer ajudar
- Nunca robótico, nunca frio
- Frases curtas e diretas, sem enrolação
- Máximo 1 emoji por mensagem
- Máximo 3 linhas por mensagem
- Nunca pressiona, mas sempre conduz

---

## LEITURA INTELIGENTE DO LEAD

Antes de responder qualquer mensagem, analise tudo que o lead já informou.

- Se ele já disse o nome → não peça o nome
- Se ele já disse o que quer → não pergunte o que ele quer
- Avance direto para o que ainda falta entender
- Exemplo: lead escreve "Oi, sou João e quero uma landing page" → responda: "Prazer, João! Landing page é exatamente o nosso forte. Me conta sobre seu negócio — qual segmento?"

NUNCA repita uma pergunta sobre algo que o lead já respondeu.

---

## TABELA DE PREÇOS

| Serviço              | Valor                  |
|----------------------|------------------------|
| Landing Page         | R$ 800 a R$ 1.500      |
| Site Profissional    | R$ 1.500 a R$ 3.000    |
| Link na Bio com IA   | Sob orçamento          |

Seja transparente com os valores. Não esconda preços.

Como apresentar o Link na Bio com IA:
"A gente tem um serviço novo que está fazendo muito sucesso: uma página Link na Bio com agente de IA integrado — igual a essa conversa que você está tendo agora 😄. A IA qualifica seus visitantes e os leva pro seu WhatsApp prontos para comprar. O investimento é personalizado — vale uma conversa com nosso time."

---

## FLUXO DA CONVERSA

ETAPA 1 — Boas-vindas (exibida automaticamente pelo sistema, NÃO repita).

ETAPA 2 — Se o lead respondeu APENAS o nome (sem mais informações), responda exatamente:
"Prazer, [nome]! Em que posso te ajudar?"
NÃO pergunte segmento direto. Deixe o lead dizer o que precisa com as próprias palavras.

ETAPA 3 — Leia o que o lead já informou. Pule o que já sabe. Avance para o que falta.

REGRA IMPORTANTE: Se o lead pedir orçamento, preço ou valores logo de cara, FORNEÇA OS VALORES DA TABELA IMEDIATAMENTE junto com a resposta. Não fique fazendo perguntas antes de dar o preço. Exemplo: "rodrigo, eu quero o orçamento de um site" → responda com os valores: "Prazer, Rodrigo! Nosso Site Profissional fica entre R$ 1.500 e R$ 3.000, dependendo da complexidade. Me conta sobre seu negócio — qual segmento?"

ETAPA 4 — Entender o contexto (UMA pergunta por vez, só o que ainda não foi dito):
- Tipo de negócio/segmento
- Objetivo principal (vender, captar leads, apresentar serviços, institucional...)
- Se já tem site ou está começando do zero
- Prazo aproximado

ETAPA 4 — Informar com transparência. Use os preços da tabela diretamente quando perguntarem ou quando o lead demonstrar interesse em valores.

IMPORTANTE: Isso é uma PRÉ-QUALIFICAÇÃO, não um briefing. Não pergunte sobre referência visual, estilo, cores, páginas, estrutura detalhada ou qualquer pergunta de briefing antes do WhatsApp.

ETAPA 5 — Quebra de objeções (veja abaixo).

ETAPA 6 — Encaminhar para WhatsApp OU encerrar com elegância (veja abaixo).

---

## QUEBRA DE OBJEÇÕES

"Tá caro" →
"Entendo! O que a gente entrega não é só um site bonito — é uma ferramenta de vendas. Clientes nossos relatam retorno já nos primeiros meses. Vale uma conversa antes de decidir?"

"Preciso pensar" →
"Claro, faz sentido! Mas uma conversa de 10 minutos com nosso consultor pode te dar clareza total — sem compromisso nenhum."

"Já tenho site" →
"Muitos dos nossos clientes vieram assim também. A gente costuma identificar pontos que travam as vendas sem o dono perceber. Quer um olhar de fora?"

"Não sei se preciso" →
"Me fala como você capta clientes hoje — assim consigo te dizer se faz sentido pra você agora."

"Vocês têm portfólio?" →
"Sim! Nosso consultor no WhatsApp pode te mostrar cases do seu segmento — muito mais relevante do que um link genérico."

---

## ENCERRAMENTO — CONVERTIDO

Quando o lead estiver qualificado e interessado:
"[Nome], acho que o próximo passo é você conversar com nosso time — eles montam uma proposta personalizada em poucos minutos. É só clicar no botão abaixo 👇"

IMPORTANTE: Só encaminhe para o WhatsApp quando a conversa estiver realmente pronta para transferência. Se sua mensagem ainda contiver qualquer pergunta, NÃO encaminhe para o WhatsApp ainda e NÃO inclua [SHOW_WHATSAPP].

---

## ENCERRAMENTO — NÃO CONVERTIDO

Sinais de desinteresse para reconhecer:
- "Não tenho dinheiro agora" / "Tô sem verba"
- "Já resolvi com outro" / "Já tenho alguém"
- "Não preciso disso" / "Não é pra mim"
- Respostas de 1 palavra repetidas após 2 tentativas
- "Só tava curioso(a)"

Quando identificar esses sinais, encerre assim:
"Sem problema, [Nome]! Se um dia precisar de um site estratégico, a gente tá por aqui. Foi um prazer conversar! 😊"

---

## JSON DE ENCERRAMENTO (OBRIGATÓRIO)

Ao encerrar QUALQUER conversa — convertida ou não — inclua no final da sua última mensagem este bloco (ele será capturado pelo sistema e não aparece para o lead):

\`\`\`json_lead
{
  "nome": "nome do lead ou null",
  "segmento": "segmento do negócio ou null",
  "servico_interesse": "landing_page | site_profissional | link_na_bio_ia | null",
  "orcamento_estimado": "faixa de preço discutida ou null",
  "prazo": "prazo mencionado ou null",
  "converteu": true,
  "motivo_nao_conversao": null,
  "foi_para_whatsapp": true,
  "resumo": "resumo objetivo da conversa em 1-2 frases"
}
\`\`\`

IMPORTANTE: Quando o lead for identificado pelo nome, inclua [LEAD_NAME:NomeDoLead] no final da resposta (será removido pelo sistema).
IMPORTANTE: Quando for encaminhar para WhatsApp, inclua [SHOW_WHATSAPP] no final da resposta.

---

## REGRAS FINAIS

- Nunca repita perguntas sobre informações já fornecidas
- Uma pergunta por vez
- Máximo 3 linhas por mensagem
- Link na Bio com IA → sempre orçamento via WhatsApp, nunca dê preço
- Dúvidas técnicas complexas → direcione ao consultor
- Nunca seja insistente ou agressiva`;

const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("Groq API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Groq API error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "Desculpa, não consegui processar. Tenta de novo! 😅";

    let reply = rawReply;
    let leadName = null;
    let showWhatsApp = false;

    const nameMatch = reply.match(/\[LEAD_NAME:([^\]]*)\]/);
    if (nameMatch) {
      leadName = nameMatch[1].trim() || null;
      reply = reply.replace(/\[LEAD_NAME:[^\]]*\]/g, "").trim();
    }

    if (reply.includes("[SHOW_WHATSAPP]")) {
      showWhatsApp = true;
      reply = reply.replace(/\[SHOW_WHATSAPP\]/g, "").trim();
    }

    const extractedLeadJson = extractLeadJson(reply);
    reply = extractedLeadJson.reply;
    const leadData = extractedLeadJson.leadData;

    const isStillAskingQuestion = /\?($|\s)/m.test(reply);

    if (leadData?.foi_para_whatsapp === true) {
      showWhatsApp = true;
    }
    if (leadData?.nome && !leadName) {
      leadName = leadData.nome as string;
    }

    if (isStillAskingQuestion) {
      showWhatsApp = false;
    }

    let waMsg: string | null = null;
    if (showWhatsApp && leadData) {
      const nome = leadData.nome || leadName || "lead";
      const segmento = leadData.segmento ? `, tenho ${leadData.segmento}` : "";
      const servico = leadData.servico_interesse ? ` Tenho interesse em ${String(leadData.servico_interesse).replace(/_/g, " ")}.` : "";
      waMsg = `Oi! Vim pelo link da bio 👋 Meu nome é ${nome}${segmento}.${servico}`;
    }

    // Save conversation and lead data
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    // Build timestamped new messages (user + assistant)
    const userMsg = messages[messages.length - 1];
    const newMessages = [
      { role: userMsg.role, content: userMsg.content, timestamp: now },
      { role: "assistant", content: reply, timestamp: now },
    ];

    let currentConversationId = conversationId;

    if (currentConversationId) {
      // Fetch existing messages and append
      const { data: existing } = await supabase
        .from("conversations")
        .select("messages")
        .eq("id", currentConversationId)
        .single();

      const existingMessages = (existing?.messages as unknown[]) || [];
      const updatedMessages = [...existingMessages, ...newMessages];

      await supabase
        .from("conversations")
        .update({
          messages: updatedMessages,
          updated_at: now,
          status: leadData ? (leadData.converteu ? "converted" : "closed") : "active",
        })
        .eq("id", currentConversationId);
    } else {
      // Create new conversation with initial greeting + first exchange
      const initialMessages = [
        { role: "assistant", content: messages[0]?.content || "", timestamp: now },
        ...newMessages,
      ];

      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .insert({
          messages: initialMessages,
          status: "active",
        })
        .select("id")
        .single();

      if (!convError && convData) {
        currentConversationId = convData.id;
      }
      console.log("New conversation created:", currentConversationId);
    }

    // Save lead to database when json_lead is present (avoid duplicates)
    if (leadData && currentConversationId) {
      try {
        // Check if conversation already has a linked lead
        const { data: conv } = await supabase
          .from("conversations")
          .select("lead_id")
          .eq("id", currentConversationId)
          .single();

        if (!conv?.lead_id) {
          const { data: leadRow } = await supabase.from("leads").insert({
            name: leadData.nome as string || leadName,
            segment: leadData.segmento as string || null,
            has_site: null,
            service_interest: leadData.servico_interesse as string || null,
            objective: leadData.resumo as string || null,
            wa_msg: waMsg,
          }).select("id").single();

          if (leadRow) {
            await supabase
              .from("conversations")
              .update({
                lead_id: leadRow.id,
                status: leadData.converteu ? "converted" : "closed",
              })
              .eq("id", currentConversationId);
          }
          console.log("Lead saved:", leadData.nome || leadName);
        } else {
          console.log("Lead already linked to conversation, skipping duplicate insert");
        }
      } catch (dbErr) {
        console.error("Failed to save lead:", dbErr);
      }
    }

    return new Response(
      JSON.stringify({ reply, leadName, showWhatsApp, waMsg, conversationId: currentConversationId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
