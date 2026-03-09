import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  message?: string;
}

const WHATSAPP_NUMBER = "5500000000000"; // Replace with real number

const WhatsAppButton = ({ message }: WhatsAppButtonProps) => {
  const defaultMsg = "Oi! Vim pelo site e quero saber mais sobre criação de sites 🚀";
  const encodedMsg = encodeURIComponent(message || defaultMsg);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[358px] flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366] text-white font-display font-semibold text-base shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all z-50"
    >
      <MessageCircle className="w-5 h-5" />
      Continuar no WhatsApp
    </motion.a>
  );
};

export default WhatsAppButton;
