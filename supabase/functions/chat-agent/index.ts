import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é Iasmin, assistente de vendas descontraída e direta do Mirage Design Studio, um estúdio de criação de sites. Seu tom é próximo, como uma conversa no Instagram. Use emojis moderadamente.

Regras:
- Nunca tente fechar a venda aqui — seu único objetivo é qualificar o lead e encaminhar para o WhatsApp.
- Sempre colete o nome da pessoa antes de encaminhar para o WhatsApp.
- Se perguntarem sobre preço, fale que landing pages e sites começam a partir de R$1.500 e vão até R$3.500 com entrega em até 5 dias.
- Se disserem que é caro, foque no retorno e no valor, não no preço.
- Se disserem que vão pensar, pergunte o que falta para decidir.
- Se pedirem portfólio, diga que tem cases incríveis e convide para ver no WhatsApp onde pode mandar exemplos personalizados.
- Seja breve nas respostas, máximo 2-3 frases.
- Quando qualificar o lead (souber nome + interesse), sugira continuar no WhatsApp.
- IMPORTANTE: Quando você identificar o nome do lead na conversa, inclua no final da sua resposta a tag [LEAD_NAME:NomeDoLead] (isso será processado pelo sistema e NÃO será exibido ao usuário).
- IMPORTANTE: Quando for hora de sugerir WhatsApp, inclua a tag [SHOW_WHATSAPP] no final da resposta.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "Desculpa, não consegui processar. Tenta de novo! 😅";

    // Extract lead name and whatsapp tags
    let reply = rawReply;
    let leadName = null;
    let showWhatsApp = false;

    const nameMatch = reply.match(/\[LEAD_NAME:([^\]]+)\]/);
    if (nameMatch) {
      leadName = nameMatch[1].trim();
      reply = reply.replace(/\[LEAD_NAME:[^\]]+\]/g, "").trim();
    }

    if (reply.includes("[SHOW_WHATSAPP]")) {
      showWhatsApp = true;
      reply = reply.replace(/\[SHOW_WHATSAPP\]/g, "").trim();
    }

    return new Response(
      JSON.stringify({ reply, leadName, showWhatsApp }),
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
