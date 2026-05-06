"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SpecialtiesCarousel } from "@/components/sections/SpecialtiesCarousel";
import { TaglineBanner } from "@/components/sections/TaglineBanner";

// Custom Social Icons
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const HERO_IMAGES = [
  "/images/hero.png",
  "/images/hero3.png",
  "/images/owners.png",
];

export default function HomePage() {
  const [currentHero, setCurrentHero] = useState(0);
  const [isFlashActive, setIsFlashActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashActive(true);
      setTimeout(() => {
        setCurrentHero((prev) => (prev + 1) % HERO_IMAGES.length);
        setTimeout(() => setIsFlashActive(false), 200);
      }, 200);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex flex-col min-h-screen pt-0">
      {/* ── FAIXA TAGLINE ── */}
      <TaglineBanner />

      {/* ── HERO ── */}
      <section className="relative h-[100dvh] flex flex-col overflow-hidden bg-cream-dark">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <Image
                src={HERO_IMAGES[currentHero]}
                alt="Um Mais Um Fotos de Família"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flash Effect */}
        <AnimatePresence>
          {isFlashActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-white"
            />
          )}
        </AnimatePresence>
      </section>

      {/* ── ENSAIOS TEMÁTICOS ── */}
      <section id="tematicos" className="py-16 bg-background relative overflow-hidden">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-serif text-primary">
                Ensaios <span className="italic">Temáticos</span>
              </h2>
              <p className="text-secondary/70">
                Sessões exclusivas criadas para datas especiais.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative bg-cream-dark p-4 rounded-sm"
            >
              <div className="relative aspect-video overflow-hidden mb-6">
                <Image
                  src="/images/hero.png"
                  alt="Sessão de Natal"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] tracking-widest uppercase px-3 py-1">
                  80% Reservado
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-serif text-primary mb-2">Especial de Natal 2026</h4>
                  <button className="text-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30">
                    Saiba Mais
                  </button>
                </div>
                <div className="text-right">
                  <div className="w-32 h-1 bg-cream-light mb-2">
                    <div className="w-[80%] h-full bg-secondary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-tighter text-secondary">Últimas 2 vagas</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative bg-cream-dark p-4 rounded-sm"
            >
              <div className="relative aspect-video overflow-hidden mb-6">
                <Image
                  src="/images/hero3.png"
                  alt="Sessão Dia das Mães"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] tracking-widest uppercase px-3 py-1">
                  Inscrições Abertas
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-serif text-primary mb-2">Cores da Maternidade</h4>
                  <button className="text-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30">
                    Saiba Mais
                  </button>
                </div>
                <div className="text-right">
                  <div className="w-32 h-1 bg-cream-light mb-2">
                    <div className="w-[15%] h-full bg-secondary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-tighter text-secondary">8 vagas disponíveis</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── GALERIA / SERVIÇOS ── */}
      <section id="servicos" className="py-16 bg-cream-dark">
        <div className="container px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
            <h3 className="text-sm font-sans tracking-[0.3em] uppercase text-secondary">
              Nossas Especialidades
            </h3>
            <h2 className="text-4xl md:text-6xl font-serif text-primary">
              Momentos que <span className="italic underline decoration-secondary/10">contam histórias.</span>
            </h2>
          </div>
          <SpecialtiesCarousel />
        </div>
      </section>

      {/* ── O ESTÚDIO ── */}
      <section id="estudio" className="py-16 bg-background relative">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full md:w-2/5 aspect-[3/5] md:h-[800px] overflow-visible"
            >
              <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl scale-125" />
              <Image
                src="/images/owners_new.png"
                alt="Proprietários do Um Mais Um Fotos"
                fill
                className="object-contain transition-all duration-700 z-10"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-2/3 space-y-6 md:space-y-8 text-center md:text-left"
            >
              <div className="space-y-4">
                <h3 className="text-xs md:text-sm font-sans tracking-[0.2em] uppercase text-secondary">
                  A Alma por trás das lentes
                </h3>
                <h2 className="text-3xl md:text-6xl font-serif text-primary leading-tight">
                  Fotógrafos, clicando os momentos mais importantes da sua <span className="italic underline decoration-secondary/30">Família.</span>
                </h2>
              </div>
              <p className="text-sm md:text-xl font-sans text-secondary/70 leading-relaxed max-w-2xl mx-auto md:mx-0">
                Somos apaixonados pela fotografia que respira. Para nós, cada ensaio é uma oportunidade de criar uma herança visual.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section id="contato" className="py-20 bg-cream-dark relative">
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-sm font-sans tracking-[0.3em] uppercase text-secondary">
                  Fale Conosco
                </h3>
                <h2 className="text-4xl md:text-5xl font-serif text-primary">
                  Vamos criar algo <br />
                  <span className="italic">memorável?</span>
                </h2>
              </div>
              <div className="space-y-8 font-sans text-secondary/70">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Inicie uma Conversa</p>
                  <a 
                    href="https://wa.me/5514998246404"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold tracking-widest transition-all duration-300 bg-secondary text-white hover:bg-opacity-90 gap-3 rounded-full w-fit"
                  >
                    <MessageCircle size={20} />
                    Enviar WhatsApp
                  </a>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Nossas Redes</p>
                  <div className="flex gap-6">
                    <a href="https://instagram.com/ummaisumfotos" target="_blank" rel="noopener noreferrer" className="p-3 bg-background rounded-full hover:text-primary transition-colors">
                      <InstagramIcon size={24} />
                    </a>
                    <a href="https://facebook.com/ummaisumfotos" target="_blank" rel="noopener noreferrer" className="p-3 bg-background rounded-full hover:text-primary transition-colors">
                      <FacebookIcon size={24} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative h-[400px] bg-background p-2 rounded-sm shadow-xl shadow-primary/5">
                <div className="w-full h-full bg-cream-dark relative overflow-hidden group">
                  <iframe 
                    src="https://maps.google.com/maps?q=Avenida+Ant%C3%B4nio+de+Almeida+Leite+1118,+Ourinhos+-+SP&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale contrast-125 opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 pointer-events-none border border-cream-dark/50" />
                </div>
              </div>
              <div className="p-6 bg-background/50 border border-cream-dark rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold mb-2">Nosso Endereço</p>
                <p className="text-lg font-serif italic text-secondary">Avenida Antônio de Almeida Leite 1118/4, Ourinhos-SP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-cream-light/40 text-center border-t border-secondary/10">
        <div className="container px-6 mx-auto space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase">© 2026 Um Mais Um Fotos • Todos os direitos reservados</p>
          <p className="text-[8px] tracking-[0.2em] uppercase opacity-50 italic">Eternizando conexões reais</p>
        </div>
      </footer>
    </main>
  );
}
