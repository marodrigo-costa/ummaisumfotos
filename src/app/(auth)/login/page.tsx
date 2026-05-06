"use client";

import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Supabase Auth Error:", error);
      if (error.message.includes("60 seconds") || error.message.toLowerCase().includes("rate limit") || error.status === 429) {
        setMessage({ type: "error", text: "Limite de envios atingido. O Supabase gratuito permite apenas 3 e-mails por hora." });
      } else {
        // Exibir o erro real para podermos diagnosticar
        setMessage({ type: "error", text: `Erro: ${error.message}` });
      }
    } else {
      setMessage({ type: "success", text: "Link enviado! Verifique sua caixa de entrada." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f3ede4] blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f3ede4] blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/20 relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="flex flex-col items-center mb-6 group">
            <div className="relative w-24 h-24 mb-2">
              <Image
                src="/images/logotipo.png"
                alt="Um Mais Um"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif tracking-tighter leading-none block text-xl">
                <span className="text-[#97816a]">Um</span>
                <span className="text-[#d1ba8e]">Mais</span>
                <span className="text-[#97816a]">Um</span>
              </span>
              <span className="font-sans tracking-[0.2em] uppercase text-[#675d4d] font-bold text-[7px] mt-1">
                FOTOS  DE  FAMÍLIA
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-serif text-[#2a2a2a] mb-2">Seja bem-vindo</h1>
          <p className="text-[#7a7a7a] font-light">Acesse suas memórias e galerias exclusivas.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#e5e5e5] text-[#2a2a2a] py-4 rounded-2xl font-medium hover:bg-[#f9f9f9] transition-all group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar com Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#f0f0f0]"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#fbf7f2]/0 px-2 text-[#7a7a7a] backdrop-blur-sm">ou via e-mail</span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1] w-5 h-5" />
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f9f9f9] border-none text-[#2a2a2a] py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-[#2a2a2a] outline-none transition-all"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2a2a2a] text-white py-4 rounded-2xl font-medium hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Link de Acesso"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl text-center text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
