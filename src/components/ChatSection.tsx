import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

interface Message {
  role: "agent" | "user";
  content: string;
}

const INITIAL_MESSAGE = "Oi! Vi que você veio pelo Instagram 👋. Meu nome é Iasmin, sou assistente aqui na Mirage Design Studio. Me fala seu nome?";



const WHATSAPP_NUMBER = "5583999804072";

// System prompt is now handled by the edge function

const ChatSection = ({ keyboardOpen = false }: { keyboardOpen?: boolean }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
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

    // Build conversation history for the AI (no system prompt - handled by edge function)
    const aiMessages = [
      ...allMessages.map((m) => ({
        role: (m.role === "agent" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const resp = await fetch(`${supabaseUrl}/functions/v1/chat-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: aiMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Request failed");
      }

      const data = await resp.json();
      setIsTyping(false);

      if (data.leadName) setLeadName(data.leadName);

      const agentMsg: Message = { role: "agent", content: data.reply };
      setMessages((prev) => [...prev, agentMsg]);

      if (data.showWhatsApp) {
        setShowWhatsApp(true);
        setWhatsAppMsg(
          data.waMsg || `Oi David! Vim pelo link da bio 👋 Sou ${data.leadName || leadName || "lead"} e tenho interesse em saber mais.`
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Ops, tive um probleminha aqui 😅 Tenta de novo ou fala com a gente no WhatsApp!" },
      ]);
      setShowWhatsApp(true);
    }
  }, [leadName]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
    await getAIResponse(text.trim(), messages);
  };


  return (
    <section className="flex flex-col h-full px-4 pb-3">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mb-3 flex-shrink-0"
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
          fala comigo agora
        </span>
      </motion.div>

      {/* Chat messages - scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-3 pb-2 sm:min-h-0">
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} />
          ))}
          {isTyping && <TypingIndicator />}

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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] text-white font-display font-semibold text-sm hover:bg-[#25D366]/90 transition-all"
              >
                📲 Continuar no WhatsApp
              </a>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input - pinned at bottom */}
      <div className="flex-shrink-0 pt-2">
        <div className="flex items-center gap-2 bg-white border border-border rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            onFocus={() => setTimeout(scrollToBottom, 300)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent text-[16px] text-black placeholder:text-black/40 outline-none font-body"
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
