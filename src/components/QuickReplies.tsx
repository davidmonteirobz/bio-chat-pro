import { motion } from "framer-motion";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
}

const QuickReplies = ({ options, onSelect }: QuickRepliesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className="text-sm px-4 py-2 rounded-full border border-primary/40 text-foreground bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
        >
          {option}
        </button>
      ))}
    </motion.div>
  );
};

export default QuickReplies;
