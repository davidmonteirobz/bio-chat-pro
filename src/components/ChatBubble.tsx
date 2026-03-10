import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  role: "agent" | "user";
  content: string;
}

const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const isAgent = role === "agent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
          isAgent
            ? "bubble-agent text-foreground rounded-2xl rounded-tl-md"
            : "bubble-user text-primary-foreground rounded-2xl rounded-tr-md font-medium"
        }`}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/80 transition-colors"
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
