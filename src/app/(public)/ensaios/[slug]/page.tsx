"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { TaglineBanner } from "@/components/sections/TaglineBanner";
import { 
  ChevronLeft, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  Calendar,
  Users
} from "lucide-react";

// WhatsApp Icon Component (Reused)
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function EnsaioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [session, setSession] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Session
        const { data: sessionData, error: sessionError } = await supabase
          .from("thematic_sessions")
          .select("*")
          .eq("slug", slug)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // Fetch Plans
        const { data: plansData, error: plansError } = await supabase
          .from("session_plans")
          .select("*")
          .eq("session_id", sessionData.id)
          .order("display_order", { ascending: true });

        if (plansError) throw plansError;
        setPlans(plansData || []);

        // Fetch Contact Info
        const { data: contactData } = await supabase
          .from("landing_content")
          .select("content")
          .eq("key", "contact")
          .single();
        
        setContact(contactData?.content);

      } catch (error) {
        console.error("Erro ao buscar dados do ensaio:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-serif text-primary mb-4">Ensaio não encontrado.</h1>
        <Link href="/ensaios" className="text-secondary underline">Voltar para listagem</Link>
      </div>
    );
  }

  const reservedPercentage = session.total_slots > 0 
    ? Math.round(((session.total_slots - session.available_slots) / session.total_slots) * 100) 
    : 0;

  const whatsappLink = `https://wa.me/${contact?.whatsapp || "5514998246404"}?text=Olá! Gostaria de saber mais sobre o ensaio temático: ${session.title}`;

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <TaglineBanner />

      {/* Hero Section do Ensaio */}
      <section className="relative h-[60dvh] flex flex-col overflow-hidden">
        <Image
          src={session.cover_image_url || "/images/hero.png"}
          alt={session.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-w-3xl"
          >
            <h1 className="text-4xl md:text-7xl font-serif text-white uppercase tracking-wider leading-tight">
              {session.title}
            </h1>
            <div className="flex items-center justify-center gap-6">
              <div className="h-px w-12 bg-white/30" />
              <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
                {session.available_slots === 0 ? "Vagas Esgotadas" : "Inscrições Abertas"}
              </p>
              <div className="h-px w-12 bg-white/30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-20">
        <div className="container px-6 mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            
            {/* Descrição e Info */}
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <h3 className="text-sm font-sans tracking-[0.3em] uppercase text-secondary">Sobre a Sessão</h3>
                <div className="text-lg md:text-xl text-secondary/70 leading-relaxed font-sans whitespace-pre-wrap">
                  {session.description || "Nenhuma descrição disponível para este ensaio."}
                </div>
              </div>

              {/* Status das Vagas */}
              <div className="bg-cream-dark p-8 rounded-sm space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-secondary/50 font-bold">Disponibilidade</p>
                    <h4 className="text-2xl font-serif text-primary">
                      {session.available_slots === 0 ? "Lista de Espera" : "Garanta sua vaga"}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-serif text-primary">{reservedPercentage}%</p>
                    <p className="text-[10px] uppercase tracking-widest text-secondary/50 font-bold">Preenchido</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-cream-light rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${reservedPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-secondary"
                  />
                </div>
                <p className="text-xs text-secondary/60 italic">
                  * Restam apenas {session.available_slots} vagas para esta temporada temática.
                </p>
              </div>
            </div>

            {/* Sidebar de Planos e Contato */}
            <div className="space-y-8">
              <div className="sticky top-24 space-y-8">
                {/* Cards de Planos */}
                <div className="space-y-4">
                  <h3 className="text-sm font-sans tracking-[0.3em] uppercase text-secondary mb-6">Investimento</h3>
                  {plans.map((plan, i) => (
                    <motion.div 
                      key={plan.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-sm border border-[#f3eee7] shadow-sm hover:border-secondary/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <h4 className="text-lg font-serif text-primary uppercase tracking-widest">{plan.name}</h4>
                          <p className="text-[10px] text-secondary/50 font-bold uppercase tracking-tighter">{plan.photo_quantity} fotos editadas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-serif text-primary">R$ {plan.price}</p>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-[#f3eee7]">
                        {plan.description.split('\n').map((item: string, j: number) => (
                          <div key={j} className="flex items-start gap-2 text-[11px] text-secondary/70">
                            <CheckCircle2 size={14} className="text-secondary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Botão de Contato */}
                <div className="p-8 bg-primary text-white rounded-sm space-y-6 text-center">
                  <div className="space-y-2">
                    <Sparkles className="mx-auto text-secondary" size={32} />
                    <h4 className="text-xl font-serif uppercase tracking-widest">Quer eternizar esse momento?</h4>
                    <p className="text-xs text-white/60 uppercase tracking-widest leading-relaxed">
                      Entre em contato para consultar datas e horários disponíveis.
                    </p>
                  </div>
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-[0.2em] transition-all duration-300 bg-secondary text-white hover:bg-white hover:text-primary gap-3 rounded-full w-full uppercase"
                  >
                    <WhatsAppIcon size={20} />
                    Entrar em Contato
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria "O que está rolando" - Movida para o final */}
      {session.highlight_images?.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container px-6 mx-auto">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h3 className="text-xs font-sans tracking-[0.4em] uppercase text-secondary/60">Portfolio</h3>
                <h2 className="text-3xl md:text-5xl font-serif text-primary">
                  {new Date(session.end_date) < new Date() ? "O que rolou" : "O que está rolando"}
                </h2>
                <div className="h-px w-20 bg-secondary/20 mx-auto" />
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {session.highlight_images.map((img: string, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative overflow-hidden group rounded-sm shadow-sm"
                  >
                    <img 
                      src={img} 
                      alt={`Amostra ${i + 1}`} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seção Ver Mais Ensaios - Mais amigável */}
      <section className="py-24 bg-[#fbf7f2] border-t border-[#f3eee7]">
        <div className="container px-6 mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60">Continue Explorando</h3>
              <h2 className="text-4xl font-serif text-primary">Deseja conhecer outros <span className="italic">temas</span>?</h2>
              <p className="text-secondary/70 text-sm uppercase tracking-widest leading-relaxed">
                Temos diversas opções de ensaios temáticos ao longo do ano para capturar cada fase da sua família.
              </p>
            </div>
            
            <Link 
              href="/ensaios"
              className="inline-flex items-center gap-4 px-10 py-5 bg-white border border-[#f3eee7] text-secondary font-bold uppercase tracking-[0.2em] text-xs hover:bg-secondary hover:text-white transition-all duration-500 rounded-full shadow-sm group"
            >
              Ver mais ensaios temáticos
              <ChevronLeft size={18} className="rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-cream-light/40 text-center border-t border-secondary/10">
        <div className="container px-6 mx-auto space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase">© 2026 Um Mais Um Fotos • Todos os direitos reservados</p>
        </div>
      </footer>
    </main>
  );
}
