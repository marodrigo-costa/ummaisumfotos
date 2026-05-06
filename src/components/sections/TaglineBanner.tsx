"use client";

import { motion } from "framer-motion";

export function TaglineBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="w-full bg-secondary flex items-center justify-center py-3 px-0"
    >
      <p className="w-full text-center text-xs md:text-sm font-sans uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-cream-light/90 px-4">
        Clicando os Momentos Mais Importantes da Sua Família
      </p>
    </motion.div>
  );
}
