"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, 
  Sparkles, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  X,
  Loader2,
  Check,
  Calendar,
  Users,
  Image as ImageIcon,
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface Plan {
  id?: string;
  name: string;
  photo_quantity: number;
  price: number;
  description: string;
}

export default function TematicosAdminPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    highlight_images: [] as string[],
    total_slots: 0,
    available_slots: 0,
    start_date: "",
    end_date: "",
    is_active: true,
    plans: [] as Plan[]
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const { data, error } = await supabase
        .from("thematic_sessions")
        .select(`
          *,
          session_plans (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (session: any = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        title: session.title,
        description: session.description || "",
        cover_image_url: session.cover_image_url || "",
        highlight_images: session.highlight_images || [],
        total_slots: session.total_slots || 0,
        available_slots: session.available_slots || 0,
        start_date: session.start_date ? new Date(session.start_date).toISOString().split('T')[0] : "",
        end_date: session.end_date ? new Date(session.end_date).toISOString().split('T')[0] : "",
        is_active: session.is_active,
        plans: session.session_plans || []
      });
    } else {
      setEditingSession(null);
      setFormData({
        title: "",
        description: "",
        cover_image_url: "",
        highlight_images: [],
        total_slots: 0,
        available_slots: 0,
        start_date: "",
        end_date: "",
        is_active: true,
        plans: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const slug = formData.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
      
      const sessionPayload = {
        title: formData.title,
        description: formData.description,
        cover_image_url: formData.cover_image_url,
        highlight_images: formData.highlight_images,
        total_slots: formData.total_slots,
        available_slots: formData.available_slots,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        slug
      };

      let sessionId = editingSession?.id;

      if (editingSession) {
        const { error } = await supabase
          .from("thematic_sessions")
          .update(sessionPayload)
          .eq("id", sessionId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("thematic_sessions")
          .insert([sessionPayload])
          .select()
          .single();
        if (error) throw error;
        sessionId = data.id;
      }

      // Sync Plans
      // 1. Delete removed plans
      if (editingSession) {
        const existingPlanIds = formData.plans.filter(p => p.id).map(p => p.id);
        await supabase
          .from("session_plans")
          .delete()
          .eq("session_id", sessionId)
          .not("id", "in", `(${existingPlanIds.join(',') || '00000000-0000-0000-0000-000000000000'})`);
      }

      // 2. Upsert current plans
      if (formData.plans.length > 0) {
        const plansToUpsert = formData.plans.map((plan, index) => ({
          ...plan,
          session_id: sessionId,
          display_order: index
        }));
        const { error: plansError } = await supabase
          .from("session_plans")
          .upsert(plansToUpsert);
        if (plansError) throw plansError;
      }

      setIsModalOpen(false);
      fetchSessions();
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
      alert("Erro ao salvar sessão. Verifique o console.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("thematic_sessions")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setSessions(sessions.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    } catch (error) {
      console.error("Erro ao mudar status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta sessão temática?")) return;
    
    try {
      const { error } = await supabase
        .from("thematic_sessions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const addPlan = () => {
    setFormData({
      ...formData,
      plans: [...formData.plans, { name: "", photo_quantity: 0, price: 0, description: "" }]
    });
  };

  const removePlan = (index: number) => {
    const newPlans = [...formData.plans];
    newPlans.splice(index, 1);
    setFormData({ ...formData, plans: newPlans });
  };

  const updatePlan = (index: number, field: keyof Plan, value: any) => {
    const newPlans = [...formData.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setFormData({ ...formData, plans: newPlans });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#2a2a2a]">Ensaios Temáticos</h2>
          <p className="text-sm text-gray-500">Gerencie as sessões especiais e sazonais do estúdio.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#2a2a2a] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm font-medium"
        >
          <Plus size={18} />
          Nova Sessão
        </button>
      </div>

      {/* Lista de Sessões */}
      <div className="bg-white rounded-[2.5rem] border border-[#f3eee7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-[#97816a]" size={40} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center">
            <Sparkles className="mx-auto text-[#d1ba8e]/50 mb-4" size={40} />
            <p className="text-[#97816a] font-serif italic">Nenhuma sessão temática cadastrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#fbf7f2]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center gap-4 p-6 hover:bg-[#fbf7f2] transition-colors group",
                  !session.is_active && "opacity-60"
                )}
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-xl bg-[#fbf7f2] overflow-hidden border border-[#f3eee7] shrink-0">
                  {session.cover_image_url ? (
                    <img src={session.cover_image_url} alt={session.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#d1ba8e]/30">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-serif text-[#2a2a2a] truncate uppercase tracking-wider">{session.title}</h3>
                    <span className="text-[9px] font-bold text-[#97816a] bg-[#f3ede4] px-2 py-0.5 rounded-full uppercase">
                      {session.available_slots} / {session.total_slots} VAGAS
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {session.start_date ? new Date(session.start_date).toLocaleDateString('pt-BR') : 'A definir'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles size={12} />
                      {session.session_plans?.length || 0} Planos
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleStatus(session.id, session.is_active)}
                    className={cn(
                      "p-3 rounded-2xl transition-all",
                      session.is_active ? "text-[#97816a] hover:bg-[#f3ede4]" : "text-gray-300 hover:bg-gray-100"
                    )}
                  >
                    {session.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button 
                    onClick={() => handleOpenModal(session)}
                    className="p-3 text-gray-400 hover:text-[#97816a] hover:bg-[#fbf7f2] rounded-2xl transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(session.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-[#f3eee7] flex items-center justify-between bg-[#fbf7f2]/50 shrink-0">
                <div>
                  <h3 className="text-2xl font-serif text-[#2a2a2a]">
                    {editingSession ? "Editar Sessão Temática" : "Nova Sessão Temática"}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Configure fotos, vagas e planos de investimento.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Coluna 1: Info Básica */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Título do Ensaio</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all uppercase tracking-wider font-serif"
                        placeholder="EX: ESPECIAL DE NATAL 2026"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Total de Vagas</label>
                        <input 
                          type="number" 
                          value={formData.total_slots || ''}
                          onChange={(e) => setFormData({...formData, total_slots: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                          className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Vagas Disponíveis</label>
                        <input 
                          type="number" 
                          value={formData.available_slots || ''}
                          onChange={(e) => setFormData({...formData, available_slots: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                          className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Data Início</label>
                        <input 
                          type="date" 
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Data Fim</label>
                        <input 
                          type="date" 
                          value={formData.end_date}
                          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                          className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Descrição do Ensaio</label>
                      <textarea 
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all resize-none text-sm leading-relaxed"
                        placeholder="Descreva a temática, o que esperar da sessão..."
                      />
                    </div>
                  </div>

                  {/* Coluna 2: Fotos */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Foto de Capa (Principal)</label>
                      <ImageUploader 
                        images={formData.cover_image_url ? [formData.cover_image_url] : []}
                        onChange={(urls) => setFormData({...formData, cover_image_url: urls[0] || ""})}
                        path="thematic/covers"
                        maxImages={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">O que está rolando (Galeria)</label>
                      <ImageUploader 
                        images={formData.highlight_images}
                        onChange={(urls) => setFormData({...formData, highlight_images: urls})}
                        path="thematic/highlights"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção de Planos */}
                <div className="space-y-6 pt-8 border-t border-[#f3eee7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#97816a]">
                      <Sparkles size={20} />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Planos de Investimento</h4>
                    </div>
                    <button 
                      type="button"
                      onClick={addPlan}
                      className="text-[10px] font-bold text-white bg-[#97816a] px-4 py-2 rounded-full uppercase tracking-widest hover:bg-[#85715d] transition-colors"
                    >
                      + Adicionar Plano
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.plans.length === 0 ? (
                      <div className="text-center py-8 bg-[#fbf7f2] rounded-3xl border border-dashed border-[#f3eee7]">
                        <p className="text-[11px] text-gray-400 uppercase tracking-widest">Nenhum plano adicionado para este ensaio.</p>
                      </div>
                    ) : (
                      formData.plans.map((plan, index) => (
                        <div key={index} className="bg-[#fbf7f2] p-6 rounded-3xl border border-[#f3eee7] space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => removePlan(index)}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome do Plano</label>
                              <input 
                                type="text"
                                value={plan.name}
                                onChange={(e) => updatePlan(index, "name", e.target.value)}
                                className="w-full bg-white border border-[#f3eee7] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-xs font-bold uppercase"
                                placeholder="EX: DIAMANTE"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Qtd. Fotos</label>
                              <input 
                                type="number"
                                value={plan.photo_quantity || ''}
                                onChange={(e) => updatePlan(index, "photo_quantity", e.target.value === '' ? 0 : parseInt(e.target.value))}
                                className="w-full bg-white border border-[#f3eee7] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                <input 
                                  type="number"
                                  value={plan.price || ''}
                                  onChange={(e) => updatePlan(index, "price", e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                  className="w-full bg-white border border-[#f3eee7] rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-xs"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Itens Inclusos</label>
                            <textarea 
                              rows={2}
                              value={plan.description}
                              onChange={(e) => updatePlan(index, "description", e.target.value)}
                              className="w-full bg-white border border-[#f3eee7] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-[11px] leading-relaxed"
                              placeholder="Ex: 10 fotos impressas, álbum luxo, figurino incluso..."
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-[#f3eee7] shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-[#2a2a2a] text-white px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    {editingSession ? "Salvar Alterações" : "Criar Sessão"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
