"use client";

import { motion } from "framer-motion";
import { Fingerprint, ArrowRight } from "lucide-react";

interface BiometricPromptProps {
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export function BiometricPrompt({ onAccept, onDecline, isLoading }: BiometricPromptProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[320px] text-center">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-[#f9f9f9] rounded-full flex items-center justify-center animate-pulse">
          <Fingerprint className="w-12 h-12 text-[#97816a]" strokeWidth={1.2} />
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-serif text-[#2a2a2a]">Acesso Rápido</h3>
          <p className="text-[#7a7a7a] text-sm leading-relaxed max-w-[280px]">
            Deseja ativar o login por biometria (Face ID / Touch ID)?
          </p>
        </div>
      </div>

      <div className="w-full space-y-3 pt-6">
        <button
          onClick={onAccept}
          disabled={isLoading}
          className="w-full bg-[#97816a] text-white py-4 rounded-2xl font-medium hover:bg-[#86725e] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
        >
          {isLoading ? "Ativando..." : "Ativar Biometria"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={onDecline}
          disabled={isLoading}
          className="w-full py-3 text-[#a1a1a1] text-sm font-medium hover:text-[#7a7a7a] transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
