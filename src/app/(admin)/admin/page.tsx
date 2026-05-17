"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  Users, 
  Camera, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  CameraIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { getDashboardStatsAdmin } from "@/app/actions/getDashboardStats";

export default function AdminDashboardPage() {
  const [userName, setUserName] = useState("Administrador");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    clients: 0,
    services: 0,
    thematic: 0,
    bookings: {
      scheduled: 0,
      pending: 0,
      completed: 0,
      delivered: 0
    }
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch current user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          
          if (profile?.full_name) {
            const firstName = profile.full_name.split(' ')[0];
            setUserName(firstName);
          }
        }

        // 2. Fetch real-time counts using admin server action
        const result = await getDashboardStatsAdmin();
        if (result.success && result.counts) {
          setCounts(result.counts);
        }

      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { name: "Total de Clientes", value: counts.clients.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Serviços Ativos", value: counts.services.toString(), icon: Camera, color: "text-[#97816a]", bg: "bg-[#f3ede4]" },
    { name: "Ensaios Temáticos", value: counts.thematic.toString(), icon: Sparkles, color: "text-[#d1ba8e]", bg: "bg-[#fff8ec]" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#97816a]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Card */}
      <div className="bg-[#2a2a2a] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-black/20">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif mb-3">
            Bom dia, {userName}.
          </h2>
          <p className="text-gray-400 font-light max-w-md leading-relaxed">
            Aqui está o resumo do que está acontecendo.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#97816a] blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-[#f3eee7] shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <div>
              <p className="text-[#a1a1a1] text-[10px] uppercase tracking-widest font-bold mb-1">{stat.name}</p>
              <h3 className="text-2xl font-serif text-[#2a2a2a]">{stat.value}</h3>
            </div>
          </motion.div>
        ))}

        {/* Card Especial: Ensaios com Funil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-[2rem] border border-[#f3eee7] shadow-sm md:col-span-1 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-purple-50">
              <CameraIcon size={20} className="text-purple-500" />
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Ensaios</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Agendados</span>
              <span className="text-sm font-medium text-[#2a2a2a]">{counts.bookings.scheduled}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Aguardando Confirmação</span>
              <span className="text-sm font-medium text-[#2a2a2a]">{counts.bookings.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Fotografado</span>
              <span className="text-sm font-medium text-[#2a2a2a]">{counts.bookings.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Disponibilizado</span>
              <span className="text-sm font-medium text-[#2a2a2a]">{counts.bookings.delivered}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-[#f3eee7] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif text-[#2a2a2a]">Ações Necessárias</h3>
            <button className="text-[10px] text-[#97816a] font-bold uppercase tracking-widest hover:underline">Ver tudo</button>
          </div>
          
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#fbf7f2] rounded-2xl flex items-center justify-center text-[#d1ba8e] mb-4">
              <Calendar size={28} />
            </div>
            <h4 className="text-lg font-serif text-[#2a2a2a] mb-2">Tudo em ordem por aqui</h4>
            <p className="text-sm text-[#a1a1a1] max-w-xs">
              Não há agendamentos pendentes ou ações urgentes para hoje.
            </p>
          </div>
        </div>

        {/* Quick Tips/Guide */}
        <div className="bg-[#f3ede4] rounded-[2.5rem] p-8 border border-[#e8dfd2]">
          <h3 className="text-lg font-serif text-[#97816a] mb-6">Dicas de Gestão</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#97816a] font-bold text-xs shrink-0 shadow-sm">1</div>
              <p className="text-sm text-[#675d4d] leading-relaxed">
                Mantenha seus **Ensaios Temáticos** atualizados com fotos de capa chamativas para aumentar os cliques.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#97816a] font-bold text-xs shrink-0 shadow-sm">2</div>
              <p className="text-sm text-[#675d4d] leading-relaxed">
                Personalize a seção **"História"** da Landing Page para criar conexão emocional com novos clientes.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#97816a] font-bold text-xs shrink-0 shadow-sm">3</div>
              <p className="text-sm text-[#675d4d] leading-relaxed">
                Use o selo de **"Novidades"** para avisar aos clientes antigos sobre novas vagas disponíveis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
