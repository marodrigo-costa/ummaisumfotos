"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, 
  Search, 
  Camera, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  GripVertical,
  X,
  Upload,
  Loader2,
  Check,
  GripHorizontal
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function ServicosAdminPage() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [] as string[],
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchServicos();
  }, []);

  async function fetchServicos() {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setServicos(data || []);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleReorder = async (newOrder: any[]) => {
    setServicos(newOrder);
    
    // Persistir nova ordem no banco
    try {
      const updates = newOrder.map((s, index) => ({
        id: s.id,
        display_order: index,
        name: s.name,
        slug: s.slug,
        is_active: s.is_active,
        images: s.images
      }));

      const { error } = await supabase
        .from("services")
        .upsert(updates);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar nova ordem:", error);
    }
  };

  const handleOpenModal = (servico: any = null) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        name: servico.name,
        description: servico.description || "",
        images: servico.images || [],
        display_order: servico.display_order ?? 0,
        is_active: servico.is_active
      });
    } else {
      setEditingServico(null);
      setFormData({
        name: "",
        description: "",
        images: [],
        display_order: 0,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const slug = formData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
      
      const payload = {
        name: formData.name,
        description: formData.description,
        images: formData.images,
        is_active: formData.is_active,
        slug,
        display_order: editingServico ? editingServico.display_order : servicos.length
      };

      if (editingServico) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingServico.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("services")
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchServicos();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar serviço. Verifique o console.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setServicos(servicos.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    } catch (error) {
      console.error("Erro ao mudar status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setServicos(servicos.filter(s => s.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#2a2a2a]">Nossos Serviços</h2>
          <p className="text-sm text-gray-500">Gerencie o que é exibido no carrossel da Landing Page.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#2a2a2a] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 text-sm font-medium"
        >
          <Plus size={18} />
          Novo Serviço
        </button>
      </div>

      {/* Lista de Serviços com Reorder (Layout Vertical para Precisão) */}
      <div className="bg-white rounded-[2.5rem] border border-[#f3eee7] shadow-sm overflow-hidden">
        <Reorder.Group 
          axis="y" 
          values={servicos} 
          onReorder={handleReorder}
          className="divide-y divide-[#fbf7f2]"
        >
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-gray-50" />
            ))
          ) : servicos.length === 0 ? (
            <div className="py-20 text-center">
              <Camera className="mx-auto text-[#d1ba8e]/50 mb-4" size={40} />
              <p className="text-[#97816a] font-serif italic">Nenhum serviço cadastrado.</p>
            </div>
          ) : (
            servicos.map((servico) => (
              <Reorder.Item
                key={servico.id}
                value={servico}
                className={cn(
                  "bg-white flex items-center gap-4 p-4 hover:bg-[#fbf7f2] transition-colors group",
                  !servico.is_active && "opacity-60"
                )}
                whileDrag={{ 
                  scale: 1.02, 
                  boxShadow: "0 20px 25px -5px rgb(0 0-0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                  zIndex: 10
                }}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-[#97816a] transition-colors">
                  <GripHorizontal size={20} />
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-xl bg-[#fbf7f2] overflow-hidden border border-[#f3eee7] shrink-0">
                  {servico.images?.[0] ? (
                    <img src={servico.images[0]} alt={servico.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#d1ba8e]/30">
                      <Camera size={18} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif text-[#2a2a2a] truncate uppercase tracking-wider">{servico.name}</h3>
                    {servico.images?.length > 1 && (
                      <span className="text-[8px] font-bold text-[#97816a] bg-[#f3ede4] px-1.5 py-0.5 rounded uppercase">
                        {servico.images.length} fotos
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate max-w-md uppercase tracking-widest">{servico.description || "Sem descrição."}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleStatus(servico.id, servico.is_active)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      servico.is_active ? "text-[#97816a] hover:bg-[#f3ede4]" : "text-gray-300 hover:bg-gray-100"
                    )}
                    title={servico.is_active ? "Ativo na Landing Page" : "Oculto na Landing Page"}
                  >
                    {servico.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button 
                    onClick={() => handleOpenModal(servico)}
                    className="p-2 text-gray-400 hover:text-[#97816a] hover:bg-[#fbf7f2] rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(servico.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Reorder.Item>
            ))
          )}
        </Reorder.Group>
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
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-[#f3eee7] flex items-center justify-between bg-[#fbf7f2]/50">
                <h3 className="text-2xl font-serif text-[#2a2a2a]">
                  {editingServico ? "Editar Serviço" : "Novo Serviço"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#97816a] uppercase tracking-widest ml-1">Nome do Serviço</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all uppercase tracking-wider"
                      placeholder="EX: ENSAIO GESTANTE"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#97816a] uppercase tracking-widest ml-1">Descrição Curta</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all resize-none uppercase tracking-wider"
                    placeholder="DESCREVA BREVEMENTE O QUE ESTÁ INCLUSO NESTE SERVIÇO..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-[#97816a] uppercase tracking-widest ml-1">Fotos do Carrossel</label>
                  
                  <ImageUploader 
                    images={formData.images}
                    onChange={(urls) => setFormData({...formData, images: urls})}
                    path="services"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#fff8ec] rounded-2xl border border-[#f3e1ce]">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 accent-[#97816a]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-[#675d4d]">Exibir este serviço na Landing Page</label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-[#f3eee7]">
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
                    {editingServico ? "Salvar Alterações" : "Criar Serviço"}
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
