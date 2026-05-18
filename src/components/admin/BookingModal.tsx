"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Camera, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  Trash2,
  DollarSign,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { publishGallery } from "@/app/actions/publishGallery";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedBooking?: any;
  preselectedClientId?: string;
  preselectedDate?: string;
  clients: any[];
  services: any[];
  sessions: any[];
  plans: any[];
}

export function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  selectedBooking,
  preselectedClientId,
  preselectedDate,
  clients,
  services,
  sessions,
  plans
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    client_id: "",
    type: "tematico" as "tematico" | "servico",
    service_id: "",
    session_id: "",
    plan_id: "",
    date: "",
    time: "09:00",
    duration: "60",
    status: "pendente",
    notes: "",
    scheduled_value: 0,
    realized_value: 0
  });

  const [isPublishingOpen, setIsPublishingOpen] = useState(false);
  const [smugmugLink, setSmugmugLink] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (selectedBooking) {
      const startDate = new Date(selectedBooking.booking_date);
      const endDate = new Date(selectedBooking.end_date || (startDate.getTime() + 30 * 60 * 1000));
      const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

      // Extrai data/hora no fuso local do navegador (evita discrepância com o calendário que usa UTC)
      const yyyy = startDate.getFullYear();
      const mm = String(startDate.getMonth() + 1).padStart(2, '0');
      const dd = String(startDate.getDate()).padStart(2, '0');
      const hh = String(startDate.getHours()).padStart(2, '0');
      const min = String(startDate.getMinutes()).padStart(2, '0');
      const localDate = `${yyyy}-${mm}-${dd}`;
      const localTime = `${hh}:${min}`;

      setFormData({
        client_id: selectedBooking.client_id,
        type: selectedBooking.plan ? "tematico" : "servico",
        service_id: selectedBooking.service_id || "",
        session_id: selectedBooking.plan?.session_id || "",
        plan_id: selectedBooking.plan_id || "",
        date: localDate,
        time: localTime,
        duration: durationMinutes.toString(),
        status: selectedBooking.status,
        notes: selectedBooking.notes || "",
        scheduled_value: selectedBooking.scheduled_value || 0,
        realized_value: selectedBooking.realized_value || 0
      });
    } else {
      setFormData({
        client_id: preselectedClientId || "",
        type: "tematico",
        service_id: "",
        session_id: "",
        plan_id: "",
        date: preselectedDate || new Date().toLocaleDateString('en-CA'), // en-CA usa formato YYYY-MM-DD em fuso local
        time: "09:00",
        duration: "60",
        status: "pendente",
        notes: "",
        scheduled_value: 0,
        realized_value: 0
      });
    }
  }, [selectedBooking, preselectedClientId, preselectedDate, isOpen]);

  // Atualiza valor programado ao mudar o plano
  useEffect(() => {
    if (formData.plan_id) {
      const plan = plans.find(p => p.id === formData.plan_id);
      if (plan) {
        setFormData(prev => ({ ...prev, scheduled_value: plan.price }));
      }
    }
  }, [formData.plan_id, plans]);

  const saveBooking = async () => {
    try {
      if (!formData.client_id || (!formData.plan_id && formData.type === 'tematico') || !formData.date || !formData.time) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
      const bookingDateISO = startDateTime.toISOString();
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60 * 1000);
      const endDateISO = endDateTime.toISOString();

      // Verifica sobreposição de horário com outros agendamentos
      let conflictQuery = supabase
        .from("bookings")
        .select("id, booking_date, end_date, client:profiles(full_name)")
        .lt("booking_date", endDateISO)   // existente começa antes do novo terminar
        .gt("end_date", bookingDateISO);  // existente termina depois do novo começar

      // Exclui o próprio agendamento ao editar
      if (selectedBooking) {
        conflictQuery = conflictQuery.neq("id", selectedBooking.id);
      }

      const { data: conflicts } = await conflictQuery;

      if (conflicts && conflicts.length > 0) {
        const conflicting = conflicts[0] as any;
        const name = conflicting.client?.full_name || "outro cliente";
        const time = new Date(conflicting.booking_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const date = new Date(conflicting.booking_date).toLocaleDateString("pt-BR");
        toast.error(`⚠️ Conflito de horário! Já existe um ensaio de ${name} em ${date} às ${time}. Por favor, escolha outro horário.`, { duration: 6000 });
        return;
      }

      const payload = {
        client_id: formData.client_id,
        plan_id: formData.type === 'tematico' ? formData.plan_id : null,
        service_id: formData.type === 'servico' ? formData.service_id : null,
        status: formData.status,
        booking_date: bookingDateISO,
        end_date: endDateISO,
        notes: formData.notes,
        scheduled_value: formData.scheduled_value,
        realized_value: formData.realized_value
      };

      if (selectedBooking) {
        const { error } = await supabase.from("bookings").update(payload).eq("id", selectedBooking.id);
        if (error) throw error;
        toast.success("Agendamento atualizado");
      } else {
        const { error } = await supabase.from("bookings").insert(payload);
        if (error) throw error;
        toast.success("Agendamento criado");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao processar agendamento");
    }
  };

  const deleteBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", selectedBooking.id);
      if (error) throw error;
      toast.success("Agendamento removido");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const handlePublishGallery = async () => {
    if (!smugmugLink) {
      toast.error("Preencha o link do SmugMug.");
      return;
    }
    
    setIsPublishing(true);
    const result = await publishGallery(selectedBooking.id, smugmugLink);
    setIsPublishing(false);

    if (result.success) {
      toast.success("Galeria disponibilizada e cliente notificado!");
      setIsPublishingOpen(false);
      setSmugmugLink("");
      onSuccess();
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-[#fbf7f2] px-5 sm:px-8 py-4 sm:py-6 border-b border-[#f3eee7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-xl flex items-center justify-center text-[#d1ba8e]">
                  <CalendarIcon size={20} />
                </div>
                <h3 className="text-xl font-serif text-[#2a2a2a]">
                  {selectedBooking ? "Editar Agendamento" : "Novo Agendamento"}
                </h3>
              </div>
              <button onClick={onClose} className="text-[#a1a1a1] hover:text-[#2a2a2a] transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6 overflow-y-auto max-h-[70vh]">
              
              {/* Cliente */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Cliente
                </label>
                <select 
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                  disabled={!!preselectedClientId}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Tipo de Ensaio */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest">Tipo de Ensaio</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({...formData, type: 'servico', plan_id: '', session_id: ''})}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                      formData.type === 'servico' 
                        ? "bg-[#2a2a2a] text-white border-[#2a2a2a]" 
                        : "bg-white text-[#a1a1a1] border-[#f3eee7] hover:border-[#97816a]"
                    )}
                  >
                    <Camera size={14} /> Estúdio / Serviço
                  </button>
                  <button
                    onClick={() => setFormData({...formData, type: 'tematico', service_id: ''})}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                      formData.type === 'tematico' 
                        ? "bg-[#2a2a2a] text-white border-[#2a2a2a]" 
                        : "bg-white text-[#a1a1a1] border-[#f3eee7] hover:border-[#97816a]"
                    )}
                  >
                    <Sparkles size={14} /> Temático
                  </button>
                </div>
              </div>

              {/* Seleção Dinâmica */}
              <AnimatePresence mode="wait">
                {formData.type === 'servico' ? (
                  <motion.div 
                    key="servico-fields"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                      <Camera size={12} /> Selecione o Serviço
                    </label>
                    <select 
                      value={formData.service_id}
                      onChange={(e) => setFormData({...formData, service_id: e.target.value})}
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                    >
                      <option value="">Selecione um serviço...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="tematico-fields"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} /> Ensaio Temático
                      </label>
                      <select 
                        value={formData.session_id}
                        onChange={(e) => setFormData({...formData, session_id: e.target.value, plan_id: ""})}
                        className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                      >
                        <option value="">Tema...</option>
                        {sessions.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#a1a1a1] uppercase tracking-widest flex items-center gap-2">
                        Pacote
                      </label>
                      <select 
                        value={formData.plan_id}
                        onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
                        className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                        disabled={!formData.session_id}
                      >
                        <option value="">Plano...</option>
                        {plans.filter(p => p.session_id === formData.session_id).map(p => (
                          <option key={p.id} value={p.id}>{p.name} - R${p.price}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon size={12} /> Data
                  </label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Início
                  </label>
                  <input 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Duração
                  </label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hora</option>
                    <option value="90">1h 30m</option>
                    <option value="120">2 horas</option>
                    <option value="180">3 horas</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['pendente', 'confirmado', 'disponibilizado'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData({...formData, status: s})}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                        formData.status === s 
                          ? "bg-[#2a2a2a] text-white border-[#2a2a2a] shadow-md" 
                          : "bg-white text-[#a1a1a1] border-[#f3eee7] hover:border-[#97816a]"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valores Financeiros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={12} /> Valor Programado
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#a1a1a1]">R$</span>
                    <input 
                      type="number"
                      value={formData.scheduled_value === 0 ? '' : formData.scheduled_value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, scheduled_value: val === '' ? 0 : parseFloat(val)});
                      }}
                      placeholder="0"
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={12} /> Valor Realizado
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#a1a1a1]">R$</span>
                    <input 
                      type="number"
                      value={formData.realized_value === 0 ? '' : formData.realized_value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, realized_value: val === '' ? 0 : parseFloat(val)});
                      }}
                      placeholder="0"
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest">Notas internas</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Alguma observação especial para este ensaio?"
                  className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20 h-24 resize-none"
                />
              </div>

              {/* Ação de Disponibilizar Ensaio */}
              {selectedBooking && formData.status !== 'disponibilizado' && (
                <div className="pt-4 border-t border-[#f3eee7]">
                  <button
                    onClick={() => setIsPublishingOpen(true)}
                    disabled={!formData.realized_value || formData.realized_value <= 0}
                    title={(!formData.realized_value || formData.realized_value <= 0) ? "Preencha o valor realizado antes de disponibilizar" : ""}
                    className="w-full bg-[#e8f7ec] text-[#219653] hover:bg-[#d1ecd9] border border-[#a2dfb5] py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon size={16} />
                    Disponibilizar Ensaio
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#fbf7f2] px-5 sm:px-8 py-4 sm:py-6 border-t border-[#f3eee7] flex items-center justify-between">
              {selectedBooking ? (
                <button 
                  onClick={deleteBooking}
                  className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest"
                >
                  <Trash2 size={16} /> Excluir
                </button>
              ) : <div />}
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="px-6 py-3 text-[#7a7a7a] text-[10px] font-bold uppercase tracking-widest hover:text-[#2a2a2a]"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveBooking}
                  className="bg-[#2a2a2a] text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#97816a] transition-all shadow-lg shadow-black/10"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>

          {/* Mini-Modal de Disponibilização da Galeria */}
          <AnimatePresence>
            {isPublishingOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isPublishing && setIsPublishingOpen(false)}
                  className="fixed inset-0 bg-[#2a2a2a]/30 backdrop-blur-sm z-[210]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl z-[220] overflow-hidden border border-[#f3eee7]"
                >
                  <div className="p-8">
                    <div className="w-14 h-14 bg-[#e8f7ec] rounded-full flex items-center justify-center mx-auto mb-5">
                      <ImageIcon size={24} className="text-[#219653]" />
                    </div>
                    <h3 className="text-xl font-serif text-[#2a2a2a] text-center mb-2">Disponibilizar Galeria</h3>
                    <p className="text-sm text-[#a1a1a1] text-center mb-6">
                      Informe o Link ou ID do SmugMug. O cliente será notificado via WhatsApp imediatamente.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#97816a] uppercase tracking-widest mb-2 ml-4">
                          Link SmugMug
                        </label>
                        <input 
                          type="text"
                          value={smugmugLink}
                          onChange={(e) => setSmugmugLink(e.target.value)}
                          placeholder="https://ummaisumfotos.smugmug.com/..."
                          disabled={isPublishing}
                          className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={() => setIsPublishingOpen(false)}
                          disabled={isPublishing}
                          className="py-3 rounded-full border border-[#e8dfd2] text-[#2a2a2a] text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handlePublishGallery}
                          disabled={isPublishing}
                          className="py-3 rounded-full bg-[#219653] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#1a7a42] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                          Confirmar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
