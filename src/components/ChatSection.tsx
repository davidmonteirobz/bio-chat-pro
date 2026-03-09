import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import ChatBubble from "./ChatBubble";
import QuickReplies from "./QuickReplies";
import TypingIndicator from "./TypingIndicator";
import WhatsAppButton from "./WhatsAppButton";

interface Message {
  role: "agent" | "user";
  content: string;
}

const INITIAL_MESSAGE = "Oi! Vi que você veio pelo Instagram 👋. Meu nome é Iasmin, sou assistente aqui na Mirage Design Studio. Me conta, o que você tá precisando?";

const QUICK_REPLIES = ["🌐 Quero um site", "💰 Quanto custa?", "✦ Ver portfólio", "📲 Falar agora"];

const WHATSAPP_NUMBER = "5500000000000";

const SYSTEM_PROMPT = `Você é Iasmin, assistente de vendas descontraída e direta do Mirage Design Studio, um estúdio de criação de sites. Seu tom é próximo, como uma conversa no Instagram. Use emojis moderadamente.

Regras:
- Nunca tente fechar a venda aqui — seu único objetivo é qualificar o lead e encaminhar para o WhatsApp.
- Sempre colete o nome da pessoa antes de encaminhar para o WhatsApp.
- Se perguntarem sobre preço, fale que landing pages e sites começam a partir de R$1.500 e vão até R$3.500 com entrega em até 5 dias.
- Se disserem que é caro, foque no retorno e no valor, não no preço.
- Se disserem que vão pensar, pergunte o que falta para decidir.
- Se pedirem portfólio, diga que tem cases incríveis e convide para ver no WhatsApp onde pode mandar exemplos personalizados.
- Seja breve nas respostas, máximo 2-3 frases.
- Quando qualificar o lead (souber nome + interesse), sugira continuar no WhatsApp.`;

const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [whatsAppMsg, setWhatsAppMsg] = useState("");
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [leadName, setLeadName] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getAIResponse = useCallback(async (userMessage: string, allMessages: Message[]) => {
    setIsTyping(true);

    // Build messages for AI
    const aiMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...allMessages.map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as "system" | "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    try {
      // Try edge function first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        const resp = await fetch(`${supabaseUrl}/functions/v1/chat-agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: aiMessages, leadName, userMessage }),
        });

        if (resp.ok) {
          const data = await resp.json();
          setIsTyping(false);

          if (data.leadName) setLeadName(data.leadName);

          const agentMsg: Message = { role: "agent", content: data.reply };
          setMessages((prev) => [...prev, agentMsg]);

          // Check if we should show WhatsApp
          if (data.reply.toLowerCase().includes("whatsapp") || data.showWhatsApp) {
            setShowWhatsApp(true);
            setWhatsAppMsg(
              `Oi! Sou ${data.leadName || "lead"} e vim pelo site. Tenho interesse em: ${userMessage}`
            );
          }
          return;
        }
      }

      // Fallback: simple local responses
      await new Promise((r) => setTimeout(r, 1500));
      setIsTyping(false);

      let reply = "Me conta mais sobre o que você precisa! 😊";
      const lower = userMessage.toLowerCase();

      if (lower.includes("site") || lower.includes("quero")) {
        reply = "Que legal! 🚀 A gente cria sites incríveis com entrega em até 5 dias. Pra eu te ajudar melhor, qual é o seu nome?";
      } else if (lower.includes("custa") || lower.includes("preço") || lower.includes("valor")) {
        reply = "Nossos sites começam a partir de R$1.500 e vão até R$3.500, dependendo da complexidade. Entrega em até 5 dias! 💪 Qual seu nome pra eu te passar mais detalhes?";
      } else if (lower.includes("portfólio") || lower.includes("portfolio") || lower.includes("ver")) {
        reply = "Temos cases incríveis! ✨ No WhatsApp consigo te mandar exemplos personalizados pro seu nicho. Me diz seu nome que te encaminho!";
      } else if (lower.includes("falar") || lower.includes("whatsapp")) {
        reply = "Bora! 📲 Me diz seu nome que já te encaminho pro nosso WhatsApp com atendimento personalizado!";
        setShowWhatsApp(true);
      }

      // Simple name detection
      if (messages.some((m) => m.content.includes("nome"))) {
        const words = userMessage.trim().split(" ");
        if (words.length <= 3 && words[0].length > 1) {
          setLeadName(words[0]);
          reply = `Prazer, ${words[0]}! 😄 Vou te encaminhar pro nosso WhatsApp pra gente conversar melhor sobre o seu projeto. Clica no botão abaixo! 👇`;
          setShowWhatsApp(true);
          setWhatsAppMsg(`Oi! Sou ${words[0]} e vim pelo site. Tenho interesse em criação de site.`);
        }
      }

      setMessages((prev) => [...prev, { role: "agent", content: reply }]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Ops, tive um probleminha aqui 😅 Tenta de novo ou fala com a gente no WhatsApp!" },
      ]);
      setShowWhatsApp(true);
    }
  }, [leadName, messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowQuickReplies(false);
    await getAIResponse(text.trim(), messages);
  };

  const handleQuickReply = (option: string) => {
    handleSend(option);
  };

  return (
    <section className="flex flex-col px-4 pb-6">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mb-4"
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
          fala comigo agora
        </span>
      </motion.div>

      {/* Chat messages */}
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {isTyping && <TypingIndicator />}
        {showQuickReplies && !isTyping && (
          <QuickReplies options={QUICK_REPLIES} onSelect={handleQuickReply} />
        )}

        {showWhatsApp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsAppMsg || "Oi! Vim pelo site e quero saber mais!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] text-white font-display font-semibold text-sm shadow-lg shadow-[#25D366]/30 hover:shadow-xl transition-all"
            >
              📲 Continuar no WhatsApp
            </a>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 w-full">
        <div className="flex items-center gap-2 bg-secondary border border-border rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
