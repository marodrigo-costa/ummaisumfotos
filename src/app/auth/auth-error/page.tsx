"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md bg-white p-10 rounded-3xl shadow-xl border border-cream-dark"
      >
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        
        <h1 className="text-2xl font-serif text-[#2a2a2a] mb-4">Ops! Algo deu errado</h1>
        <p className="text-[#7a7a7a] mb-8 leading-relaxed">
          O link de autenticação pode ter expirado ou já ter sido utilizado. 
          Por favor, tente solicitar um novo link de acesso.
        </p>

        <Link 
          href="/login"
          className="inline-flex items-center gap-2 bg-[#2a2a2a] text-white px-8 py-4 rounded-2xl font-medium hover:bg-black transition-all"
        >
          <ArrowLeft size={18} />
          Voltar para o Login
        </Link>
      </motion.div>
    </div>
  );
}
