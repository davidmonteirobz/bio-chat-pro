import { motion } from "framer-motion";
import avatarImg from "@/assets/avatar.png";

const tags = ["Web Design", "Landing Pages", "Sites Profissionais"];

const BioHeader = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center pt-10 pb-6 px-4 relative"
    >
      {/* Orange glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-3xl opacity-30 bg-primary pointer-events-none" />

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mb-4"
      >
        <img
          src={avatarImg}
          alt="Mirage Design Studio"
          className="w-24 h-24 rounded-full object-cover avatar-ring"
        />
      </motion.div>

      {/* Name */}
      <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
        Mirage Design Studio
      </h1>
      <p className="text-muted-foreground text-sm mt-1 text-center max-w-[280px]">
        Criamos sites que convertem visitantes em clientes. Rápido, bonito e estratégico.
      </p>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.header>
  );
};

export default BioHeader;
