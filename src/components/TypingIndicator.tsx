import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bubble-agent rounded-2xl rounded-tl-md w-fit">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
