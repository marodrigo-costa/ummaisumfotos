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
  Bell,
  MessageCircle,
  Lock
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PWAInstallGuide from "@/components/pwa/InstallGuide";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Compliance States
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const [allowMarketing, setAllowMarketing] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
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
        setAcceptTerms(profileData.accept_terms || false);
        setAllowNotifications(profileData.allow_notifications || false);
        setAllowMarketing(profileData.allow_marketing || false);

        // Se não tem nome, abre edição automaticamente (Onboarding)
        if (!profileData.full_name) {
          setIsEditing(true);
        }

        const { data: galleryData } = await supabase
          .from("galleries")
          .select("*")
          .eq("client_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (galleryData) {
          setGalleries(galleryData);
        }
      }
      setLoading(false);
      
      // Verificar modo standalone
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
      }
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
          accept_terms: acceptTerms,
          allow_notifications: allowNotifications,
          allow_marketing: allowMarketing,
          phone: newPhone,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ 
        ...profile, 
        full_name: newName, 
        phone: newPhone,
        accept_terms: acceptTerms,
        allow_notifications: allowNotifications,
        allow_marketing: allowMarketing
      });
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
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#f3eee7] relative group"
            >
              {/* Botão Editar Integrado */}
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#97816a] hover:bg-[#fbf7f2] rounded-full transition-all duration-300 z-20"
                title="Editar Perfil"
              >
                <Settings size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
                
                <div className="relative mb-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="relative w-24 h-24 group cursor-pointer outline-none"
                    title="Clique para trocar sua foto"
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-[#fbf7f2] shadow-inner z-10" />
                    {profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Avatar'} 
                        fill 
                        className="object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#97816a] rounded-full flex items-center justify-center text-3xl font-bold text-white uppercase">
                        {firstName?.[0]}
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Camera className="text-white mb-0.5" size={16} />
                      <span className="text-[7px] text-white uppercase font-bold tracking-widest">Alterar</span>
                    </div>

                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-30">
                        <Loader2 className="text-white animate-spin size-5" />
                      </div>
                    )}
                  </button>
                </div>

                <h2 className="text-lg font-serif text-[#2a2a2a] mb-2">{profile?.full_name || 'Membro'}</h2>
                
                {/* Contact Info Compact */}
                <div className="flex flex-col gap-1 items-center mb-4">
                  <div className="flex items-center gap-1.5 text-gray-400 bg-[#fbf7f2] px-3 py-1 rounded-full border border-[#f3eee7]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    <span className="text-[10px] font-medium tracking-wide">{profile?.phone}</span>
                  </div>
                </div>

                {/* Badges de Compliance */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {acceptTerms && (
                    <div className="px-2 py-0.5 bg-green-50 text-green-600 text-[8px] uppercase font-bold rounded-md border border-green-100 flex items-center gap-1">
                      <CheckCircle2 size={8} />
                      LGPD
                    </div>
                  )}
                  {allowMarketing && (
                    <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] uppercase font-bold rounded-md border border-blue-100 flex items-center gap-1">
                      <ImageIcon size={8} />
                      Uso Imagem
                    </div>
                  )}
                  {allowNotifications && (
                    <div className="px-2 py-0.5 bg-[#fff8ec] text-[#e87c3a] text-[8px] uppercase font-bold rounded-md border border-[#f3e1ce] flex items-center gap-1">
                      <Bell size={8} />
                      Novidades
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-[#f3eee7] mb-4" />
                
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Desde {memberSince}
                </div>
              </div>
            </motion.div>

            {/* 4. PWA Tutorial */}
            {!isStandalone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:block hidden" 
              >
                <div className="bg-[#1a1a1a] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-[#d1ba8e]">
                      <Smartphone size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Instalação</span>
                    </div>
                    <h3 className="text-xl font-serif mb-4 leading-tight">Acesse como um Aplicativo</h3>
                    <p className="text-sm text-gray-400 font-light mb-6">Instale nosso app para aprimorar sua experiência.</p>
                    
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
            )}
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
              </div>

              {galleries.length > 0 ? (
                <div className="space-y-4">
                  {galleries.map((gallery) => (
                    <div key={gallery.id} className="p-6 border border-cream-dark rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-[#fbf7f2]/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#e8f7ec] rounded-2xl flex items-center justify-center text-[#219653]">
                          <ImageIcon size={24} />
                        </div>
                        <div>
                          <h4 className="font-serif text-lg text-[#2a2a2a]">Ensaio Disponível</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-[#a1a1a1]">
                            <span>{new Date(gallery.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={gallery.smugmug_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-[#219653] text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-[#1a7a42] transition-all shadow-lg shadow-[#219653]/20 flex justify-center items-center gap-2"
                      >
                        Ver Fotos <ExternalLink size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-cream-dark rounded-[2rem] bg-[#fbf7f2]/30">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-[#d1ba8e]">
                    <ImageIcon size={28} />
                  </div>
                  <h4 className="text-lg font-serif text-[#2a2a2a] mb-2">Suas memórias sendo reveladas</h4>
                  <p className="text-[#a1a1a1] max-w-sm text-sm font-light">
                    Ainda não temos galerias disponíveis. Fique tranquilo, assim que estiverem prontas você receberá uma notificação.
                  </p>
                </div>
              )}
                   {/* PWA Tutorial for Mobile (Only visible on small screens) */}
            {!isStandalone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:hidden block mt-8"
              >
                <div className="bg-[#1a1a1a] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-[#d1ba8e]">
                      <Smartphone size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Instalação</span>
                    </div>
                    <h3 className="text-xl font-serif mb-4 leading-tight">Acesse como um Aplicativo</h3>
                    <p className="text-sm text-gray-400 font-light mb-6">Instale nosso app para aprimorar sua experiência.</p>
                    
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
            )}           </motion.div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            key="edit-profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 z-10"
              >
                <X size={20} />
              </button>

              <div className="mb-8 shrink-0">
                <h2 className="text-3xl font-serif text-[#2a2a2a] mb-2">Editar Perfil</h2>
                <p className="text-[#7a7a7a] text-sm">Atualize seus dados de contato abaixo.</p>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6 overflow-y-auto pr-2 flex-1">
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
                    <div className="space-y-1.5 opacity-60">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">
                        Celular / WhatsApp (Identificador de Acesso)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newPhone}
                          disabled
                          className="w-full bg-gray-100 border-none rounded-2xl p-4 text-sm font-light text-gray-500 cursor-not-allowed"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Lock size={14} className="text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes de Compliance */}
                    <div className="space-y-4 bg-[#fbf7f2] p-6 rounded-3xl border border-[#f3eee7]">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#97816a] font-bold mb-2">Consentimentos e LGPD</h4>
                      
                      <div className="flex items-start gap-3 group">
                        <input 
                          type="checkbox"
                          id="terms-checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-1 size-4 rounded border-[#d1ba8e] text-[#97816a] focus:ring-[#97816a] cursor-pointer"
                          required
                        />
                        <div className="text-xs text-gray-600 font-light leading-relaxed flex-1">
                          <label htmlFor="terms-checkbox" className="cursor-pointer group-hover:text-black transition-colors">Aceito os </label>
                          <span 
                            className="font-bold underline cursor-pointer text-[#97816a] hover:text-[#7a6855]" 
                            onClick={() => setIsTermsModalOpen(true)}
                          >
                            Termos de Uso
                          </span>
                          <label htmlFor="terms-checkbox" className="cursor-pointer group-hover:text-black transition-colors"> e autorizo o tratamento dos meus dados conforme a LGPD.</label>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={allowNotifications}
                          onChange={(e) => setAllowNotifications(e.target.checked)}
                          className="mt-1 size-4 rounded border-[#d1ba8e] text-[#97816a] focus:ring-[#97816a]"
                        />
                        <span className="text-xs text-gray-600 font-light leading-relaxed group-hover:text-black transition-colors">
                          Quero receber notificações sobre novos ensaios e promoções.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={allowMarketing}
                          onChange={(e) => setAllowMarketing(e.target.checked)}
                          className="mt-1 size-4 rounded border-[#d1ba8e] text-[#97816a] focus:ring-[#97816a]"
                        />
                        <span className="text-xs text-gray-600 font-light leading-relaxed group-hover:text-black transition-colors">
                          Autorizo o uso de minhas fotos para fins de portfólio e divulgação do estúdio.
                        </span>
                      </label>
                    </div>

                <div className="flex gap-4 pt-4 pb-2 shrink-0 border-t border-[#f3eee7] mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-medium text-secondary hover:bg-[#fbf7f2] transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving || !acceptTerms}
                    className="flex-1 bg-[#2a2a2a] text-white px-6 py-4 rounded-2xl font-medium hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Use Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <motion.div 
            key="terms-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative max-h-[80vh] flex flex-col"
            >
              <button 
                onClick={() => setIsTermsModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-serif text-[#2a2a2a] mb-2">Termos de Uso & LGPD</h2>
              <p className="text-[#7a7a7a] text-sm mb-6">Última atualização: Maio de 2026</p>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm font-light text-gray-600">
                <p>
                  <strong>1. Coleta e Tratamento de Dados</strong><br />
                  Seus dados pessoais (nome, telefone e imagens) são coletados exclusivamente para a prestação dos serviços fotográficos contratados, incluindo a entrega de galerias, contato administrativo e segurança da sua conta.
                </p>
                <p>
                  <strong>2. Armazenamento e Segurança</strong><br />
                  Suas fotografias são armazenadas em servidores seguros (Supabase) e são protegidas por autenticação criptografada, não havendo indexação pública a menos que autorizado explicitamente por você para fins de portfólio.
                </p>
                <p>
                  <strong>3. Direitos do Titular (LGPD)</strong><br />
                  Você tem o direito de solicitar, a qualquer momento, o acesso, a alteração ou a exclusão dos seus dados pessoais e de suas imagens do nosso banco de dados, através de contato direto com a administração do estúdio.
                </p>
                <p>
                  <strong>4. Comunicações</strong><br />
                  Utilizamos o número de WhatsApp fornecido como chave de acesso à plataforma (passwordless) e para o envio de mensagens transacionais essenciais (ex: notificações de que sua galeria está pronta). Mensagens promocionais dependem do seu consentimento explícito.
                </p>
                <p>
                  <strong>5. Concordância</strong><br />
                  Ao aceitar os termos, você declara ciência e autoriza o tratamento dos dados listados conforme o artigo 7º da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-[#f3eee7] flex justify-end">
                <button 
                  onClick={() => setIsTermsModalOpen(false)}
                  className="bg-[#2a2a2a] text-white px-8 py-3 rounded-2xl font-medium hover:bg-black transition-all shadow-lg shadow-black/10"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <PWAInstallGuide />
    </div>
  );
}
