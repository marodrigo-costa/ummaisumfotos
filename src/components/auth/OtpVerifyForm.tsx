"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface OtpVerifyFormProps {
  phone: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onChangePhone: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function OtpVerifyForm({ phone, onSubmit, onResend, onChangePhone, isLoading, error }: OtpVerifyFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatPhone = (p: string) => {
    if (p.length === 11) {
      return `(${p.substring(0,2)}) ${p.substring(2,7)}-${p.substring(7)}`;
    }
    return p;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newCode = [...code];
    // Se o usuário colou o código inteiro
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newCode[index + i] = pasted[i];
      }
      setCode(newCode);
      // Focar no último input preenchido
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Auto avança pro próximo input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Volta pro input anterior ao apagar vazio
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      onSubmit(fullCode);
    }
  };

  const isComplete = code.every(digit => digit !== "");

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <p className="text-[#7a7a7a] text-sm mb-1">Enviamos um código para o WhatsApp</p>
        <p className="font-medium text-[#2a2a2a]">{formatPhone(phone)}</p>
        <button 
          onClick={onChangePhone}
          type="button"
          className="text-xs text-[#97816a] underline mt-1"
        >
          Número incorreto?
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-[#f9f9f9] border border-[#eee] text-[#2a2a2a] rounded-2xl focus:ring-2 focus:ring-[#97816a] outline-none transition-all"
            />
          ))}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !isComplete}
          className="w-full bg-[#97816a] text-white py-4 rounded-2xl font-medium hover:bg-[#86725e] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 shadow-sm"
        >
          {isLoading ? "Verificando..." : "Verificar Código"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="text-center">
        <button 
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="text-xs text-[#7a7a7a] hover:text-[#2a2a2a] transition-colors"
        >
          Não recebeu? <span className="font-medium underline">Reenviar código</span>
        </button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl text-center text-sm bg-red-50 text-red-700"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
