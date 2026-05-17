"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Share, PlusSquare, MoreVertical, Download, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function PWAInstallGuide() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Capturar o evento de instalação do Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasClosed = localStorage.getItem('pwa_guide_closed');

    if (!isStandalone && !hasClosed) {
      // Detecta se é dispositivo móvel
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShow(false);
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('pwa_guide_closed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-4 left-4 right-4 z-[300] md:left-auto md:right-8 md:bottom-8 md:max-w-[320px]"
        >
          <div className="bg-[#1a1a1a] text-white rounded-[2rem] p-5 shadow-2xl border border-white/5 relative overflow-hidden">
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors z-30"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="w-10 h-10 bg-[#97816a] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Download size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-serif text-base leading-tight">Instale o App</h4>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#d1ba8e] font-bold">EXPERIÊNCIA APRIMORADA</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-light mb-5 relative z-10">
              Instale nosso app para aprimorar sua experiência.
            </p>

            <div className="relative z-10">
              {platform === "android" && deferredPrompt ? (
                <button 
                  onClick={handleInstallClick}
                  className="w-full bg-[#97816a] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#86715b] transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone size={14} />
                  Instalar Agora
                </button>
              ) : (
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  {platform === "ios" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Share size={12} className="text-blue-400 shrink-0" />
                        <p className="text-[11px]">Toque em <strong>Compartilhar</strong> no Safari</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <PlusSquare size={12} className="shrink-0" />
                        <p className="text-[11px]">Selecione <strong>Tela de Início</strong></p>
                      </div>
                    </div>
                  ) : platform === "android" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MoreVertical size={12} className="shrink-0" />
                        <p className="text-[11px]">Toque nos <strong>três pontos</strong> do Chrome</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Smartphone size={12} className="text-green-400 shrink-0" />
                        <p className="text-[11px]">Toque em <strong>Adicionar à tela inicial</strong> ou <strong>Instalar aplicativo</strong></p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-center italic text-gray-500">
                      Acesse pelo celular para instalar.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Background Detail */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#97816a] blur-3xl opacity-20" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
