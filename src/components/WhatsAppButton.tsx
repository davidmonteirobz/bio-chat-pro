import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  message?: string;
}

const WHATSAPP_NUMBER = "5583999804072";

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
      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#25D366] text-[#25D366] bg-transparent font-display font-semibold text-base hover:bg-[#25D366]/10 transition-all"
    >
      <MessageCircle className="w-5 h-5" />
      Continuar no WhatsApp
    </motion.a>
  );
};

export default WhatsAppButton;
