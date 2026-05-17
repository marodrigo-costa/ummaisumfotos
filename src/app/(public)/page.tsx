"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SpecialtiesCarousel } from "@/components/sections/SpecialtiesCarousel";
import { TaglineBanner } from "@/components/sections/TaglineBanner";
import { createClient } from "@/utils/supabase/client";

// ── Ícones ──────────────────────────────────────────────────
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ── Defaults estáticos (página renderiza sem banco) ──────────
const HERO_IMAGES = ["/images/hero.png", "/images/hero3.png", "/images/owners.png"];
const DEFAULT_CONTACT = { whatsapp: "5514998246404", cta_text: "Enviar WhatsApp", instagram: "ummaisumfotos", address: "Avenida Antônio de Almeida Leite 1118/4, Ourinhos-SP" };
const DEFAULT_STORY = { title: "NOSSA HISTÓRIA", text: "Somos apaixonados pela fotografia que respira. Para nós, cada ensaio é uma oportunidade de criar uma herança visual.", image: "/images/owners_new.png" };

export default function HomePage() {
  const [currentHero, setCurrentHero] = useState(0);
  const [contact, setContact]     = useState(DEFAULT_CONTACT);
  const [story, setStory]         = useState(DEFAULT_STORY);
  const [heroImages, setHeroImages] = useState(HERO_IMAGES);
  const [sessions, setSessions]   = useState<any[]>([]);
  const supabaseRef = useRef(createClient());

  // Slideshow do Hero
  useEffect(() => {
    const t = setInterval(() => setCurrentHero(p => (p + 1) % heroImages.length), 8000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  // Fetch de dados — completamente isolado, nunca bloqueia renderização
  useEffect(() => {
    const sb = supabaseRef.current;
    let alive = true;

    (async () => {
      try {
        const { data } = await sb.from("landing_content").select("*");
        if (!alive || !data) return;
        data.forEach(item => {
          if (!item?.content || typeof item.content !== "object") return;
          if (item.key === "hero" && Array.isArray(item.content.images) && item.content.images.length)
            setHeroImages(item.content.images);
          if (item.key === "story")   setStory(p => ({ ...p, ...item.content }));
          if (item.key === "contact") setContact(p => ({ ...p, ...item.content }));
        });
      } catch (_) { /* silencioso */ }

      try {
        const { data } = await sb
          .from("thematic_sessions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(2);
        if (alive) setSessions(data ?? []);
      } catch (_) { /* silencioso */ }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <main className="flex flex-col min-h-screen">

      {/* ── TAGLINE ── */}
      <TaglineBanner />

      {/* ── HERO ── */}
      <section className="relative h-[50dvh] md:h-[65dvh] overflow-hidden bg-[#f5f0e8]">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 2 }, scale: { duration: 8, ease: "linear" } }}
              className="absolute inset-0"
            >
              <Image src={heroImages[currentHero]} alt="Um Mais Um Fotos" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-black/5" />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── ENSAIOS TEMÁTICOS (só se houver sessões ativas) ── */}
      {sessions.length > 0 && (
        <section id="tematicos" className="py-16 bg-background">
          <div className="container px-6 mx-auto">
            <div className="mb-12 space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-primary">
                Ensaios <span className="italic">Temáticos</span>
              </h2>
              <p className="text-secondary/70">Sessões exclusivas criadas para datas especiais.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {sessions.map((session, index) => {
                const total = session.total_slots ?? 0;
                const avail = session.available_slots ?? 0;
                const pct   = total > 0 ? Math.round(((total - avail) / total) * 100) : 0;
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="group bg-cream-dark p-4 rounded-sm"
                  >
                    <div className="relative aspect-video overflow-hidden mb-6">
                      <Image
                        src={session.cover_image_url || "/images/hero.png"}
                        alt={session.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className={cn(
                        "absolute top-4 right-4 text-white text-[10px] tracking-widest uppercase px-3 py-1",
                        pct > 70 ? "bg-primary" : "bg-secondary"
                      )}>
                        {pct >= 100 ? "Esgotado" : pct > 70 ? `${pct}% Reservado` : "Inscrições Abertas"}
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-serif text-primary mb-2 uppercase tracking-wider">{session.title}</h4>
                        <Link href={`/ensaios/${session.slug}`} className="text-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30">
                          Saiba Mais
                        </Link>
                      </div>
                      <div className="text-right">
                        <div className="w-32 h-1 bg-cream-light mb-2">
                          <div className="h-full bg-secondary" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] uppercase tracking-tighter text-secondary">
                          {avail === 0 ? "Vagas encerradas" : `${avail} vagas disponíveis`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <Link href="/ensaios" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all">
                Ver todos os ensaios
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SERVIÇOS ── */}
      <section id="servicos" className="py-16 bg-cream-dark">
        <div className="container px-6 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
            <h3 className="text-sm font-sans tracking-[0.3em] uppercase text-secondary">Nossas Especialidades</h3>
            <h2 className="text-4xl md:text-6xl font-serif text-primary">
              Momentos que <span className="italic underline decoration-secondary/10">contam histórias.</span>
            </h2>
          </div>
          <SpecialtiesCarousel />
        </div>
      </section>

      {/* ── HISTÓRIA ── */}
      <section id="historia" className="py-16 bg-background relative">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="md:hidden space-y-4 text-center">
              <h3 className="text-xs font-sans tracking-[0.2em] uppercase text-secondary">A Alma por trás das lentes</h3>
              <h2 className="text-3xl font-serif text-primary leading-tight uppercase tracking-wider">{story.title}</h2>
            </div>

            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative w-full md:w-2/5 aspect-[3/5] md:h-[800px]">
              <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl scale-125" />
              <Image src={story.image} alt="Sobre o Um Mais Um Fotos" fill className="object-contain z-10" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-2/3 space-y-6 md:space-y-8 text-center md:text-left">
              <div className="hidden md:block space-y-4">
                <h3 className="text-xs md:text-sm font-sans tracking-[0.2em] uppercase text-secondary">A Alma por trás das lentes</h3>
                <h2 className="text-3xl md:text-6xl font-serif text-primary leading-tight uppercase tracking-wider">{story.title}</h2>
              </div>
              <p className="text-sm md:text-xl font-sans text-secondary/70 leading-relaxed max-w-2xl mx-auto md:mx-0">{story.text}</p>
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
                <h3 className="text-sm font-sans tracking-[0.3em] uppercase text-secondary">Fale Conosco</h3>
                <h2 className="text-4xl md:text-5xl font-serif text-primary">Vamos criar algo <br /><span className="italic">memorável?</span></h2>
              </div>
              <div className="space-y-8 font-sans text-secondary/70">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Inicie uma Conversa</p>
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold tracking-widest bg-secondary text-white gap-3 rounded-full w-fit uppercase hover:bg-opacity-90 transition-all">
                    <WhatsAppIcon size={20} />{contact.cta_text}
                  </a>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Nossas Redes</p>
                  <div className="flex gap-6">
                    <a href={`https://instagram.com/${contact.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-background rounded-full hover:text-primary transition-colors">
                      <InstagramIcon size={24} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative h-[400px] bg-background p-2 rounded-sm shadow-xl shadow-primary/5">
                <div className="w-full h-full bg-cream-dark relative overflow-hidden group">
                  <iframe src="https://maps.google.com/maps?q=Avenida+Ant%C3%B4nio+de+Almeida+Leite+1118,+Ourinhos+-+SP&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale contrast-125 opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100" />
                </div>
              </div>
              <div className="p-6 bg-background/50 border border-cream-dark rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold mb-2">Nosso Endereço</p>
                <p className="text-lg font-serif italic text-secondary">{contact.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 bg-primary text-cream-light/40 text-center border-t border-secondary/10">
        <div className="container px-6 mx-auto space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase">© 2026 Um Mais Um Fotos • Todos os direitos reservados</p>
          <p className="text-[8px] tracking-[0.2em] uppercase opacity-50 italic">Eternizando conexões reais</p>
        </div>
      </footer>

    </main>
  );
}
