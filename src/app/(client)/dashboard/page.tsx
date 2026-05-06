"use client";

import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  Image as ImageIcon, 
  ChevronRight,
  Camera,
  Calendar,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Apple,
  Upload,
  Loader2,
  X,
  Mail,
  MessageCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setNewName(profileData.full_name || "");
        setNewPhone(profileData.phone || "");
      }
      setLoading(false);
    }

    getProfile();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: newName,
          phone: newPhone,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: newName, phone: newPhone });
      setIsEditing(false);
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (error: any) {
      alert("Erro ao enviar foto: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#97816a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0];
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('pt-BR') 
    : '--/--/----';

  return (
    <div className="min-h-screen bg-[#fbf7f2] pt-12 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="font-sans tracking-[0.3em] uppercase text-[#97816a] text-[10px] font-bold mb-2">Bem-vindo(a) à sua área</p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#2a2a2a]">
              Olá, <span className="italic">{firstName}</span>.
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white border border-cream-dark px-6 py-3 rounded-2xl text-sm font-medium text-secondary hover:bg-[#f3ede4] transition-all"
            >
              <Settings size={18} />
              Editar Dados
            </button>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Profile + PWA */}
          <div className="lg:col-span-1 space-y-8 w-full order-1">
            {/* 1. Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-cream-dark">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar with contextual upload */}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="relative w-32 h-32 mb-6 group cursor-pointer outline-none"
                    title="Clique para trocar sua foto"
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-[#fbf7f2] shadow-inner z-10" />
                    {profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Avatar'} 
                        fill 
                        className="object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#97816a] rounded-full flex items-center justify-center text-4xl font-bold text-white uppercase">
                        {firstName?.[0]}
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Camera className="text-white mb-1" size={24} />
                      <span className="text-[8px] text-white uppercase font-bold tracking-widest">Alterar Foto</span>
                    </div>

                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-30">
                        <Loader2 className="text-white animate-spin" />
                      </div>
                    )}
                  </button>

                  <h2 className="text-xl font-serif text-[#2a2a2a] mb-4">{profile?.full_name || 'Membro'}</h2>
                  
                  {/* Contact Info */}
                  <div className="flex flex-col gap-2 mb-8 w-full px-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-[#a1a1a1] group">
                      <Mail size={14} className="text-[#97816a]" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center justify-center gap-2 text-sm text-[#a1a1a1]">
                        <MessageCircle size={14} className="text-[#97816a]" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fbf7f2] rounded-full text-[10px] uppercase tracking-widest text-[#97816a] font-bold">
                    MEMBRO DESDE {memberSince}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 4. PWA Tutorial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:block hidden" // Hidden on mobile, handled by order below
            >
              <div className="bg-[#2a2a2a] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-[#d1ba8e]">
                    <Smartphone size={20} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Instalação</span>
                  </div>
                  <h3 className="text-xl font-serif mb-4 leading-tight">Acesse como um Aplicativo</h3>
                  <p className="text-sm text-gray-400 font-light mb-6">Instale em seu celular para acessar suas fotos e receber notificações.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors cursor-help">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                          <Apple size={14} className="text-white" />
                        </div>
                        <span className="text-xs">No iPhone (Safari)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span>Compartilhar</span>
                        <ChevronRight size={10} />
                        <span>Tela de Início</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors cursor-help">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                          <Smartphone size={14} className="text-[#3ddc84]" />
                        </div>
                        <span className="text-xs">No Android (Chrome)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span>Menu</span>
                        <ChevronRight size={10} />
                        <span>Instalar App</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#97816a] blur-3xl opacity-10 translate-x-10 -translate-y-10" />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Agendamentos + Galleries */}
          <div className="lg:col-span-2 space-y-8 w-full order-2">
            
            {/* 2. Agendamentos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-cream-dark"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif text-[#2a2a2a]">Seus Agendamentos</h3>
                <span className="p-2 bg-[#fbf7f2] rounded-xl text-[#97816a]">
                  <Calendar size={20} />
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-6 border border-cream-dark rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-[#fbf7f2]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#f3ede4] rounded-2xl flex items-center justify-center text-[#97816a]">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-[#2a2a2a]">Ensaio Gestante</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[#a1a1a1]">
                        <span>A confirmar</span>
                        <span>•</span>
                        <span>Outubro/2026</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-[#2a2a2a] text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-black transition-all shadow-lg shadow-black/5">
                    Confirmar Data
                  </button>
                </div>

                <p className="text-center text-xs text-[#a1a1a1] pt-4 italic">
                  Você será notificado sobre qualquer alteração.
                </p>
              </div>
            </motion.div>

            {/* 3. Galleries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-cream-dark"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif text-[#2a2a2a]">Suas Galerias</h3>
                <span className="text-[10px] font-sans tracking-widest text-[#a1a1a1] uppercase font-bold">Em breve</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-cream-dark rounded-[2rem] bg-[#fbf7f2]/30">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-[#d1ba8e]">
                  <ImageIcon size={28} />
                </div>
                <h4 className="text-lg font-serif text-[#2a2a2a] mb-2">Suas memórias sendo reveladas</h4>
                <p className="text-[#a1a1a1] max-w-sm text-sm font-light">
                  Ainda não temos galerias disponíveis. Fique tranquilo, assim que estiverem prontas você receberá uma notificação.
                </p>
              </div>
            </motion.div>

            {/* PWA Tutorial for Mobile (Only visible on small screens) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:hidden block"
            >
              <div className="bg-[#2a2a2a] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-[#d1ba8e]">
                    <Smartphone size={20} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Instalação</span>
                  </div>
                  <h3 className="text-xl font-serif mb-4 leading-tight">Acesse como um Aplicativo</h3>
                  <p className="text-sm text-gray-400 font-light mb-6">Instale em seu celular para acessar suas fotos e receber notificações.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors cursor-help">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                          <Apple size={14} className="text-white" />
                        </div>
                        <span className="text-xs">No iPhone (Safari)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span>Compartilhar</span>
                        <ChevronRight size={10} />
                        <span>Tela de Início</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors cursor-help">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                          <Smartphone size={14} className="text-[#3ddc84]" />
                        </div>
                        <span className="text-xs">No Android (Chrome)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span>Menu</span>
                        <ChevronRight size={10} />
                        <span>Instalar App</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-serif text-[#2a2a2a] mb-2">Editar Perfil</h2>
              <p className="text-[#7a7a7a] text-sm mb-8">Atualize seus dados de contato abaixo.</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold mb-2 ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#fbf7f2] border-none rounded-2xl p-4 text-[#2a2a2a] focus:ring-2 focus:ring-[#97816a] outline-none transition-all"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold mb-2 ml-1">Celular / WhatsApp</label>
                  <input 
                    type="tel" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#fbf7f2] border-none rounded-2xl p-4 text-[#2a2a2a] focus:ring-2 focus:ring-[#97816a] outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-medium text-secondary hover:bg-[#fbf7f2] transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-[#2a2a2a] text-white px-6 py-4 rounded-2xl font-medium hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
