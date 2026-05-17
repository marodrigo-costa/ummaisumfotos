"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { TaglineBanner } from "@/components/sections/TaglineBanner";
import { Filter, Calendar, ChevronLeft } from "lucide-react";

export default function EnsaiosListingPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("Todos");
  const [years, setYears] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const { data, error } = await supabase
        .from("thematic_sessions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setSessions(data || []);
      
      // Extract unique years from created_at or start_date
      const uniqueYears = Array.from(new Set(data?.map(s => 
        new Date(s.start_date || s.created_at).getFullYear().toString()
      ))).sort((a, b) => b.localeCompare(a));
      
      setYears(["Todos", ...uniqueYears]);
    } catch (error) {
      console.error("Erro ao buscar ensaios:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSessions = selectedYear === "Todos" 
    ? sessions 
    : sessions.filter(s => new Date(s.start_date || s.created_at).getFullYear().toString() === selectedYear);

  return (
    <main className="flex flex-col min-h-screen bg-[#fbf7f2]">
      <TaglineBanner />
      
      {/* Header Seção */}
      <section className="pt-20 pb-12 bg-white border-b border-[#f3eee7]">
        <div className="container px-6 mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft size={16} />
            Voltar para Início
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-serif text-primary">
                Todos os <span className="italic">Ensaios</span>
              </h1>
              <p className="text-secondary/70 max-w-xl uppercase tracking-widest text-[10px] font-bold">
                Explore nossa galeria de momentos especiais capturados ao longo dos anos.
              </p>
            </div>
            
            {/* Filtro por Ano */}
            <div className="flex items-center gap-4 bg-[#fbf7f2] p-2 rounded-2xl border border-[#f3eee7] w-fit">
              <div className="p-2 text-[#97816a]">
                <Filter size={18} />
              </div>
              <div className="flex gap-1">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      selectedYear === year 
                        ? "bg-white text-[#97816a] shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Ensaios */}
      <section className="py-16">
        <div className="container px-6 mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-sm" />
                  <div className="h-6 bg-gray-200 w-2/3" />
                  <div className="h-4 bg-gray-200 w-full" />
                </div>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Calendar className="mx-auto text-[#d1ba8e]/30" size={48} />
              <p className="text-[#97816a] font-serif italic text-xl">Nenhum ensaio encontrado para este período.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <AnimatePresence mode="popLayout">
                {filteredSessions.map((session, index) => {
                  const reservedPercentage = session.total_slots > 0 
                    ? Math.round(((session.total_slots - session.available_slots) / session.total_slots) * 100) 
                    : 0;
                  
                  return (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative bg-white p-4 rounded-sm border border-[#f3eee7] hover:shadow-xl hover:shadow-black/5 transition-all"
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
                          reservedPercentage > 70 ? "bg-primary" : "bg-secondary"
                        )}>
                          {reservedPercentage >= 100 ? "Esgotado" : reservedPercentage > 70 ? `${reservedPercentage}% Reservado` : "Inscrições Abertas"}
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-xl font-serif text-primary mb-2 uppercase tracking-wider truncate">{session.title}</h4>
                          <Link 
                            href={`/ensaios/${session.slug}`}
                            className="text-xs text-secondary hover:text-primary transition-colors underline decoration-secondary/30 font-bold uppercase tracking-widest"
                          >
                            Saiba Mais
                          </Link>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="w-24 h-1 bg-cream-light mb-2">
                            <div 
                              className="h-full bg-secondary" 
                              style={{ width: `${reservedPercentage}%` }}
                            />
                          </div>
                          <p className="text-[8px] uppercase tracking-tighter text-secondary font-bold">
                            {session.available_slots === 0 ? "Esgotado" : `${session.available_slots} vagas`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 text-center border-t border-[#f3eee7]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-secondary/40">© 2026 Um Mais Um Fotos • Estúdio Criativo</p>
      </footer>
    </main>
  );
}
