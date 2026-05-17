"use client";

import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, 
  Loader2, 
  Users,
  Globe,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingModal } from "@/components/admin/BookingModal";
import "./calendar.css";

// Tipos
interface Booking {
  id: string;
  client_id: string;
  plan_id?: string;
  service_id?: string;
  status: string;
  booking_date: string;
  end_date?: string;
  notes?: string;
  scheduled_value?: number;
  realized_value?: number;
  client?: {
    full_name: string;
    phone: string;
  };
  service?: {
    name: string;
  };
  plan?: {
    name: string;
    price: number;
    session_id: string;
    thematic_sessions?: {
      title: string;
    };
  };
}

interface Client {
  id: string;
  full_name: string;
  phone: string;
}

interface ThematicSession {
  id: string;
  title: string;
}

interface SessionPlan {
  id: string;
  session_id: string;
  name: string;
  price: number;
}

export default function AgendamentosPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [sessions, setSessions] = useState<ThematicSession[]>([]);
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Financial filter state — independent from the calendar
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toLocaleDateString('en-CA');
  const [finFrom, setFinFrom] = useState(firstDayOfMonth);
  const [finTo, setFinTo] = useState(lastDayOfMonth);

  const filteredBookings = useMemo(() => {
    if (!finFrom && !finTo) return bookings;
    return bookings.filter(b => {
      const d = new Date(b.booking_date);
      const from = finFrom ? new Date(finFrom + 'T00:00:00') : null;
      const to = finTo ? new Date(finTo + 'T23:59:59') : null;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [bookings, finFrom, finTo]);

  const totalScheduled = filteredBookings.reduce((acc, b) => acc + (b.scheduled_value || 0), 0);
  const totalRealized = filteredBookings.reduce((acc, b) => acc + (b.realized_value || 0), 0);
  const totalPending = totalScheduled - totalRealized;
  const realizationPct = totalScheduled > 0 ? Math.min(Math.round((totalRealized / totalScheduled) * 100), 100) : 0;

  function setPreset(preset: 'month' | 'last_month' | 'year') {
    const n = new Date();
    if (preset === 'month') {
      setFinFrom(new Date(n.getFullYear(), n.getMonth(), 1).toLocaleDateString('en-CA'));
      setFinTo(new Date(n.getFullYear(), n.getMonth() + 1, 0).toLocaleDateString('en-CA'));
    } else if (preset === 'last_month') {
      setFinFrom(new Date(n.getFullYear(), n.getMonth() - 1, 1).toLocaleDateString('en-CA'));
      setFinTo(new Date(n.getFullYear(), n.getMonth(), 0).toLocaleDateString('en-CA'));
    } else {
      setFinFrom(new Date(n.getFullYear(), 0, 1).toLocaleDateString('en-CA'));
      setFinTo(new Date(n.getFullYear(), 11, 31).toLocaleDateString('en-CA'));
    }
  }

  const supabase = createClient();

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setLoading(true);
      
      const { data: bData, error: bError } = await supabase
        .from("bookings")
        .select(`
          *,
          client:profiles(full_name, phone),
          service:services(name),
          plan:session_plans(
            name, 
            price, 
            session_id,
            thematic_sessions(title)
          )
        `);
      
      if (bError) {
        console.error("Erro ao buscar bookings:", JSON.stringify(bError, null, 2));
        throw new Error(bError.message || "Erro na busca de bookings");
      }
      setBookings(bData || []);

      const { data: cData } = await supabase.from("profiles").select("id, full_name, phone").order("full_name");
      setClients(cData || []);

      const { data: srvData } = await supabase.from("services").select("id, name").eq("is_active", true);
      setServices(srvData || []);

      const { data: sData } = await supabase.from("thematic_sessions").select("id, title").eq("is_active", true);
      setSessions(sData || []);

      const { data: pData } = await supabase.from("session_plans").select("id, session_id, name, price");
      setPlans(pData || []);

    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  const calendarEvents = bookings.map(b => {
    const isTematico = !!b.plan;
    const titleText = isTematico 
      ? `${b.client?.full_name || 'Cliente'} - ${b.plan?.thematic_sessions?.title || 'Temático'}`
      : `${b.client?.full_name || 'Cliente'} - ${b.service?.name || 'Ensaio de Estúdio'}`;

    // Garante que o FullCalendar receba objetos de data ou strings ISO consistentes
    const start = new Date(b.booking_date);
    const end = b.end_date ? new Date(b.end_date) : new Date(start.getTime() + 30 * 60 * 1000);

    return {
      id: b.id,
      title: titleText,
      start: start.toISOString(),
      end: end.toISOString(),
      className: `status-${b.status}`,
      extendedProps: b
    };
  });

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps as Booking;
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDateClick = (info: any) => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#97816a]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[#2a2a2a]">Agenda de Ensaios</h2>
          <p className="text-sm text-[#a1a1a1]">Gerencie seus horários e conexões com o Google Calendar.</p>
        </div>
        
        <button 
          onClick={() => {
            setSelectedBooking(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#2a2a2a] text-white px-6 py-3 rounded-2xl hover:bg-[#97816a] transition-all shadow-lg shadow-black/10 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-bold uppercase tracking-widest">Novo Agendamento</span>
        </button>
      </div>

      {/* Google Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#f3ede4] rounded-[2.5rem] p-6 border border-[#e8dfd2] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#97816a] shadow-sm">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="text-sm font-serif text-[#97816a]">Google Calendar</h4>
              <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">Sincronização Ativa</p>
            </div>
          </div>
          <button className="text-[10px] bg-white text-[#97816a] px-4 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-[#97816a] hover:text-white transition-all shadow-sm">
            Configurar
          </button>
        </div>

        <div className="bg-[#f3ede4] rounded-[2.5rem] p-6 border border-[#e8dfd2] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#97816a] shadow-sm">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-sm font-serif text-[#97816a]">Google Contacts</h4>
              <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">45 Contatos Sincronizados</p>
            </div>
          </div>
          <button className="text-[10px] bg-white text-[#97816a] px-4 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-[#97816a] hover:text-white transition-all shadow-sm">
            Sincronizar Agora
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-[#f3eee7] shadow-sm overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="pt-br"
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
          }}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          height="auto"
          events={calendarEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={true}
          eventDrop={async (info) => {
            const id = info.event.id;
            const newStart = info.event.startStr;
            const newEnd = info.event.endStr || new Date(info.event.start!.getTime() + 30 * 60 * 1000).toISOString();

            // Verifica sobreposição antes de salvar
            const { data: conflicts } = await supabase
              .from("bookings")
              .select("id, booking_date, client:profiles(full_name)")
              .lt("booking_date", newEnd)
              .gt("end_date", newStart)
              .neq("id", id);

            if (conflicts && conflicts.length > 0) {
              const conflicting = conflicts[0] as any;
              const name = conflicting.client?.full_name || "outro cliente";
              const time = new Date(conflicting.booking_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              toast.error(`⚠️ Conflito! Já existe um ensaio de ${name} nesse horário (${time}). Mova para outro horário.`, { duration: 6000 });
              info.revert();
              return;
            }
            
            const { error } = await supabase.from("bookings").update({
              booking_date: newStart,
              end_date: newEnd
            }).eq("id", id);

            if (error) {
              toast.error("Erro ao mover agendamento");
              info.revert();
            } else {
              setBookings(prev => prev.map(b => 
                b.id === id 
                  ? { ...b, booking_date: newStart, end_date: newEnd }
                  : b
              ));
              toast.success("Horário atualizado");
            }
          }}
        />
      </div>

      {/* Resumo Financeiro — com filtro de período próprio */}
      <div className="bg-white rounded-[2.5rem] border border-[#f3eee7] shadow-sm overflow-hidden">
        {/* Header do card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 pt-8 pb-6 border-b border-[#f3eee7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fbf7f2] rounded-xl flex items-center justify-center text-[#97816a]">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-lg font-serif text-[#2a2a2a]">Apuração Financeira</h3>
              <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">
                {filteredBookings.length} ensaio{filteredBookings.length !== 1 ? 's' : ''} no período
              </p>
            </div>
          </div>

          {/* Filtro de intervalo */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Atalhos de período */}
            <div className="flex gap-1.5">
              {[['month', 'Este mês'], ['last_month', 'Mês anterior'], ['year', 'Este ano']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPreset(key as any)}
                  className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest border border-[#f3eee7] text-[#97816a] hover:bg-[#97816a] hover:text-white hover:border-[#97816a] transition-all"
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Inputs de data */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#fbf7f2] border border-[#f3eee7] rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-[#a1a1a1] uppercase">De</span>
                <input
                  type="date"
                  value={finFrom}
                  onChange={e => setFinFrom(e.target.value)}
                  className="bg-transparent text-xs text-[#2a2a2a] outline-none cursor-pointer"
                />
              </div>
              <span className="text-[#c9b9a8]">/</span>
              <div className="flex items-center gap-1.5 bg-[#fbf7f2] border border-[#f3eee7] rounded-xl px-3 py-2">
                <span className="text-[10px] font-bold text-[#a1a1a1] uppercase">Até</span>
                <input
                  type="date"
                  value={finTo}
                  onChange={e => setFinTo(e.target.value)}
                  className="bg-transparent text-xs text-[#2a2a2a] outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#f3eee7]">
          <div className="px-8 py-6 space-y-1">
            <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">Receita Programada</p>
            <p className="text-3xl font-serif text-[#2a2a2a]">
              R$ {totalScheduled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#a1a1a1]">Valor previsto nos agendamentos</p>
          </div>

          <div className="px-8 py-6 space-y-1">
            <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">Receita Realizada</p>
            <p className="text-3xl font-serif text-emerald-600">
              R$ {totalRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#a1a1a1]">Valor efetivamente recebido</p>
          </div>

          <div className="px-8 py-6 space-y-1">
            <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">A Receber</p>
            <p className={cn("text-3xl font-serif", totalPending > 0 ? "text-amber-600" : "text-emerald-600")}>
              R$ {Math.max(totalPending, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#a1a1a1]">Diferença programado vs. realizado</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#a1a1a1] uppercase tracking-widest">Taxa de Apuração</span>
            <span className={cn("text-sm font-serif font-bold", realizationPct >= 100 ? "text-emerald-600" : realizationPct >= 50 ? "text-amber-600" : "text-rose-500")}>
              {realizationPct}%
            </span>
          </div>
          <div className="h-2 bg-[#f3eee7] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                realizationPct >= 100 ? "bg-emerald-500" : realizationPct >= 50 ? "bg-amber-500" : "bg-rose-400"
              )}
              style={{ width: `${realizationPct}%` }}
            />
          </div>
          {filteredBookings.length === 0 && (
            <p className="text-center text-sm text-[#a1a1a1] mt-6">Nenhum agendamento no período selecionado.</p>
          )}
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInitialData}
        selectedBooking={selectedBooking}
        clients={clients}
        services={services}
        sessions={sessions}
        plans={plans}
      />
    </div>
  );
}
