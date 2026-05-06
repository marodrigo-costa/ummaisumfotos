"use client";

import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Image as ImageIcon, Bell, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [portfolioConsent, setPortfolioConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [userName, setUserName] = useState("");
  const [modalContent, setModalContent] = useState<"terms" | "privacy" | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // ... (checkUser logic remains)

  const Modal = ({ type, onClose }: { type: "terms" | "privacy"; onClose: () => void }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] p-8 sm:p-12 overflow-y-auto relative z-10 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-[#fbf7f2] rounded-full transition-colors"
        >
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>

        <h2 className="text-3xl font-serif text-[#2a2a2a] mb-8">
          {type === "terms" ? "Termos de Uso" : "Política de Privacidade"}
        </h2>
        
        <div className="prose prose-stone text-[#5a5a5a] space-y-6 leading-relaxed">
          {type === "terms" ? (
            <>
              <p>Ao acessar o sistema Um Mais Um Fotos, você concorda em cumprir estes termos...</p>
              <h3 className="font-medium text-[#2a2a2a]">1. Uso de Galeria</h3>
              <p>As galerias são para uso pessoal. O estúdio garante a guarda das fotos por 6 meses.</p>
              <h3 className="font-medium text-[#2a2a2a]">2. Propriedade Intelectual</h3>
              <p>Os direitos autorais pertencem ao estúdio, com direito de uso pessoal ao cliente.</p>
            </>
          ) : (
            <>
              <p>Sua privacidade é nossa prioridade. Coletamos apenas dados essenciais...</p>
              <h3 className="font-medium text-[#2a2a2a]">1. Segurança</h3>
              <p>Seus dados são protegidos por criptografia e nunca vendidos a terceiros.</p>
              <h3 className="font-medium text-[#2a2a2a]">2. Seus Direitos</h3>
              <p>Você pode solicitar a exclusão de seus dados a qualquer momento.</p>
            </>
          )}
        </div>
        
        <button 
          onClick={onClose}
          className="mt-10 w-full bg-[#2a2a2a] text-white py-4 rounded-2xl font-medium hover:bg-black transition-all"
        >
          Entendi e Fechar
        </button>
      </motion.div>
    </motion.div>
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserName(user.user_metadata.full_name || "");
      
      // Check if already completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("agreed_to_terms_at")
        .eq("id", user.id)
        .single();
        
      if (profile?.agreed_to_terms_at) {
        router.push("/");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!agreedToTerms) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          agreed_to_terms_at: new Date().toISOString(),
          portfolio_consent: portfolioConsent,
          marketing_consent: marketingConsent,
        })
        .eq("id", user.id);

      if (!error) {
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3ede4] rounded-full text-[#2a2a2a] text-xs font-medium mb-6">
            <Shield className="w-3 h-3" />
            Privacidade & Segurança (LGPD)
          </div>
          <h1 className="text-4xl font-serif text-[#2a2a2a] mb-4">
            Olá{userName ? `, ${userName.split(' ')[0]}` : ''}. <br />
            Vamos cuidar da sua privacidade?
          </h1>
          <p className="text-[#7a7a7a] font-light leading-relaxed">
            Para garantir que suas fotos e dados estejam seguros de acordo com a Lei Geral de Proteção de Dados, precisamos que você defina suas preferências.
          </p>
        </div>

        {/* Consent Options */}
        <div className="space-y-6 mb-10">
          {/* Terms (Mandatory) */}
          <div 
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              agreedToTerms ? "border-[#2a2a2a] bg-[#fbf7f2]" : "border-[#f0f0f0] hover:border-[#e0e0e0]"
            }`}
          >
            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              agreedToTerms ? "bg-[#2a2a2a] border-[#2a2a2a]" : "border-[#d1d1d1]"
            }`}>
              {agreedToTerms && <Check className="text-white w-4 h-4" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[#2a2a2a] mb-1">Aceito os Termos e Privacidade *</h3>
              <p className="text-sm text-[#7a7a7a]">
                Confirmo que li e aceito a{" "}
                <button 
                  onClick={() => setModalContent("privacy")}
                  className="underline hover:text-[#2a2a2a] transition-colors"
                >
                  política de privacidade
                </button>{" "}
                e os{" "}
                <button 
                  onClick={() => setModalContent("terms")}
                  className="underline hover:text-[#2a2a2a] transition-colors"
                >
                  termos de uso
                </button>{" "}
                do estúdio.
              </p>
            </div>
          </div>

          {/* Portfolio (Optional) */}
          <div 
            onClick={() => setPortfolioConsent(!portfolioConsent)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              portfolioConsent ? "border-[#2a2a2a] bg-[#fbf7f2]" : "border-[#f0f0f0] hover:border-[#e0e0e0]"
            }`}
          >
            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              portfolioConsent ? "bg-[#2a2a2a] border-[#2a2a2a]" : "border-[#d1d1d1]"
            }`}>
              {portfolioConsent && <Check className="text-white w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-[#7a7a7a]" />
                <h3 className="font-medium text-[#2a2a2a]">Uso para Portfólio</h3>
              </div>
              <p className="text-sm text-[#7a7a7a]">Autorizo o uso de minhas fotos para divulgação do trabalho do estúdio em redes sociais e site.</p>
            </div>
          </div>

          {/* Marketing (Optional) */}
          <div 
            onClick={() => setMarketingConsent(!marketingConsent)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              marketingConsent ? "border-[#2a2a2a] bg-[#fbf7f2]" : "border-[#f0f0f0] hover:border-[#e0e0e0]"
            }`}
          >
            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              marketingConsent ? "bg-[#2a2a2a] border-[#2a2a2a]" : "border-[#d1d1d1]"
            }`}>
              {marketingConsent && <Check className="text-white w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-[#7a7a7a]" />
                <h3 className="font-medium text-[#2a2a2a]">Novidades e Ensaios</h3>
              </div>
              <p className="text-sm text-[#7a7a7a]">Desejo ser avisado sobre novos ensaios temáticos (ex: Natal) e condições especiais.</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleSubmit}
          disabled={!agreedToTerms || loading}
          className="w-full bg-[#2a2a2a] text-white py-5 rounded-[1.5rem] font-medium hover:bg-black transition-all flex items-center justify-center gap-3 group disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-black/10"
        >
          {loading ? "Salvando..." : "Concluir e Acessar"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-center text-xs text-[#a1a1a1]">
          * Campo obrigatório para acesso ao sistema.
        </p>
      </motion.div>

      <AnimatePresence>
        {modalContent && (
          <Modal type={modalContent} onClose={() => setModalContent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
