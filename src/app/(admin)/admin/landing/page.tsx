"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Save, 
  Layout, 
  Image as ImageIcon, 
  Loader2,
  Check,
  History,
  Phone
} from "lucide-react";

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

type TabType = "hero" | "story" | "contact";

export default function LandingAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  // State for all landing content
  const [hero, setHero] = useState({
    title: "MEMÓRIAS QUE O TEMPO NÃO APAGA",
    subtitle: "FOTOGRAFIA AFETIVA DE FAMÍLIA E GESTANTE NO CORAÇÃO DE SÃO PAULO",
    images: [] as string[]
  });

  const [story, setStory] = useState({
    title: "NOSSA HISTÓRIA",
    text: "",
    image: ""
  });

  const [contact, setContact] = useState({
    whatsapp: "",
    cta_text: "QUERO AGENDAR MEU ENSAIO",
    instagram: "",
    address: ""
  });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const { data, error } = await supabase
        .from("landing_content")
        .select("*");

      if (error) throw error;

      data?.forEach(item => {
        if (item.key === "hero") setHero(item.content);
        if (item.key === "story") setStory(item.content);
        if (item.key === "contact") setContact(item.content);
      });
    } catch (error) {
      console.error("Erro ao buscar conteúdo:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "hero", content: hero },
        { key: "story", content: story },
        { key: "contact", content: contact }
      ];

      const { error } = await supabase
        .from("landing_content")
        .upsert(updates);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#97816a]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#2a2a2a] uppercase tracking-wider">Gestão do Site</h2>
          <p className="text-sm text-gray-500 uppercase tracking-widest text-[10px]">Customize o conteúdo da página inicial do seu estúdio.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg text-sm font-bold uppercase tracking-widest",
            success ? "bg-green-500 text-white" : "bg-[#2a2a2a] text-white hover:bg-black shadow-black/10"
          )}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : success ? <Check size={18} /> : <Save size={18} />}
          {success ? "Salvo com Sucesso" : "Salvar Alterações"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1 bg-white border border-[#f3eee7] rounded-2xl w-fit">
        {[
          { id: "hero", label: "Início", icon: Layout },
          { id: "story", label: "História", icon: History },
          { id: "contact", label: "WhatsApp & CTA", icon: WhatsAppIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-[#fbf7f2] text-[#97816a] shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-[#f3eee7] p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {activeTab === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-[#fbf7f2] p-8 rounded-[2rem] border border-[#f3eee7] text-center space-y-4">
                <ImageIcon className="mx-auto text-[#97816a]/30" size={48} />
                <h3 className="text-sm font-bold text-[#97816a] uppercase tracking-widest">Carrossel de Entrada</h3>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest max-w-md mx-auto">Nesta seção o foco é totalmente visual. As fotos subidas aqui serão exibidas em tela cheia na entrada do site.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Fotos do Carrossel Principal</label>
                <ImageUploader 
                  images={hero.images}
                  onChange={(urls) => setHero({...hero, images: urls})}
                  path="landing/hero"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "story" && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Título da Seção</label>
                    <input 
                      type="text"
                      value={story.title}
                      onChange={(e) => setStory({...story, title: e.target.value})}
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all uppercase tracking-wider font-serif"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Nossa História (Texto)</label>
                    <textarea 
                      rows={10}
                      value={story.text}
                      onChange={(e) => setStory({...story, text: e.target.value})}
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-sm leading-relaxed"
                      placeholder="Conte sobre o estúdio, sua paixão pela fotografia..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Foto da Seção História</label>
                  <ImageUploader 
                    images={story.image ? [story.image] : []}
                    onChange={(urls) => setStory({...story, image: urls[0] || ""})}
                    path="landing/story"
                  />
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest text-center italic">Uma foto que represente o estúdio ou a fotógrafa.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-[#fbf7f2] rounded-3xl border border-[#f3eee7] space-y-4">
                    <div className="flex items-center gap-3 text-[#97816a] mb-2">
                      <WhatsAppIcon size={24} />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Call to Action (WhatsApp)</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Texto do Botão Principal</label>
                      <input 
                        type="text"
                        value={contact.cta_text}
                        onChange={(e) => setContact({...contact, cta_text: e.target.value})}
                        className="w-full bg-white border border-[#f3eee7] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#97816a] transition-all uppercase tracking-wider text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp (Apenas números)</label>
                      <input 
                        type="text"
                        value={contact.whatsapp}
                        onChange={(e) => setContact({...contact, whatsapp: e.target.value.replace(/\D/g, "")})}
                        className="w-full bg-white border border-[#f3eee7] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-xs"
                        placeholder="Ex: 11999999999"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Endereço do Estúdio</label>
                    <textarea 
                      rows={3}
                      value={contact.address}
                      onChange={(e) => setContact({...contact, address: e.target.value})}
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-sm"
                      placeholder="Ex: Av. Paulista, 1000 - Sala 10..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#97816a] uppercase tracking-widest ml-1">Instagram (@usuario)</label>
                    <input 
                      type="text"
                      value={contact.instagram}
                      onChange={(e) => setContact({...contact, instagram: e.target.value})}
                      className="w-full bg-[#fbf7f2] border border-[#f3eee7] rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#97816a] transition-all text-sm"
                      placeholder="Ex: @ummaisumfotos"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  );
}
