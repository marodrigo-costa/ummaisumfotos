"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  User, 
  Phone, 
  Image as ImageIcon, 
  Calendar, 
  AlertCircle,
  MoreVertical,
  Loader2,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Save,
  MessageCircle,
  Camera
} from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getClientDetailsAdmin, updateClientAdminAction } from "@/app/actions/getClientDetails";
import { BookingModal } from "@/components/admin/BookingModal";

export default function AdminClienteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data for Modal
  const [services, setServices] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchClientDetails();
    fetchModalData();
  }, [clientId]);

  async function fetchModalData() {
    const { data: srvData } = await supabase.from("services").select("id, name").eq("is_active", true);
    setServices(srvData || []);

    const { data: sData } = await supabase.from("thematic_sessions").select("id, title").eq("is_active", true);
    setSessions(sData || []);

    const { data: pData } = await supabase.from("session_plans").select("id, session_id, name, price");
    setPlans(pData || []);
  }

  async function fetchClientDetails() {
    setLoading(true);
    try {
      const result = await getClientDetailsAdmin(clientId);
      
      if (result.success && result.data) {
        setClientData(result.data);
        setFullName(result.data.full_name || "");
        setPhone(result.data.phone || "");
      } else {
        console.error("Erro ao buscar detalhes:", result.error);
        toast.error("Erro ao carregar dados do cliente.");
        router.push('/admin/clientes');
      }
    } catch (error) {
      console.error("Erro fatal:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateClientAdminAction(clientId, {
        full_name: fullName,
        phone: phone.replace(/\D/g, '')
      });

      if (!result.success) throw new Error(result.error);
      
      toast.success("Dados atualizados com sucesso!");
      fetchClientDetails();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(error.message || "Erro ao salvar os dados.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (currentStatus: boolean) => {
    try {
      const result = await updateClientAdminAction(clientId, { is_active: !currentStatus });
      if (!result.success) throw new Error(result.error);
      
      toast.success(currentStatus ? "Cliente inativado." : "Cliente reativado.");
      fetchClientDetails();
    } catch (error) {
      toast.error("Erro ao alterar status.");
    }
  };

  const toggleAdmin = async (currentAdmin: boolean) => {
    if (currentAdmin) {
      toast.error("Não é possível remover o status de admin por aqui por segurança.");
      return;
    }
    
    if (confirm("Tem certeza que deseja promover este cliente a Administrador? Ele terá acesso total ao painel.")) {
      try {
        const result = await updateClientAdminAction(clientId, { is_admin: true });
        if (!result.success) throw new Error(result.error);
        
        toast.success("Usuário promovido a Administrador!");
        fetchClientDetails();
      } catch (error) {
        toast.error("Erro ao promover usuário.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#97816a]" size={32} />
      </div>
    );
  }

  if (!clientData) return null;

  const isInactive = clientData.is_active === false;
  const isAdmin = clientData.is_admin === true;
  const bookings = clientData.bookings || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/clientes')}
            className="w-10 h-10 rounded-full bg-white border border-[#e8dfd2] flex items-center justify-center text-[#2a2a2a] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-3xl font-serif text-[#2a2a2a]">Perfil do Cliente</h2>
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex gap-2">
          {isAdmin && (
            <span className="bg-purple-100 text-purple-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} />
              Administrador
            </span>
          )}
          {isInactive ? (
            <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Lock size={14} />
              Inativo
            </span>
          ) : (
            <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Unlock size={14} />
              Ativo
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Editor & Actions */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#f3eee7]">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#f3ede4] flex items-center justify-center mb-4 border-4 border-white shadow-md">
                {clientData.avatar_url ? (
                  <Image 
                    src={clientData.avatar_url} 
                    alt={clientData.full_name || "Cliente"} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera size={32} className="text-[#97816a]" />
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold">Foto do Perfil</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#675d4d] mb-2 ml-4">Nome Completo</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-3 bg-[#fbf7f2] border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#675d4d] mb-2 ml-4">WhatsApp / Telefone</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3 bg-[#fbf7f2] border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#97816a] text-white py-4 rounded-full font-bold tracking-widest text-[10px] uppercase hover:bg-[#856b56] transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Alterações
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 rounded-[2.5rem] p-8 border border-red-100">
            <h3 className="text-sm font-bold text-red-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={16} />
              Ações Perigosas
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => toggleStatus(!isInactive)}
                className={`w-full py-3 rounded-2xl font-bold tracking-widest text-[10px] uppercase transition-colors flex items-center justify-center gap-2 border ${
                  isInactive ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                {isInactive ? <Unlock size={14} /> : <Lock size={14} />}
                {isInactive ? "Reativar Cliente" : "Inativar Cliente"}
              </button>

              {!isAdmin && (
                <button 
                  onClick={() => toggleAdmin(isAdmin)}
                  className="w-full bg-white border border-purple-200 text-purple-700 py-3 rounded-2xl font-bold tracking-widest text-[10px] uppercase hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={14} />
                  Promover a Administrador
                </button>
              )}
            </div>
            
            <p className="text-xs text-red-500/70 mt-4 text-center leading-relaxed">
              Inativar o cliente bloqueará o seu acesso ao sistema. O histórico será mantido intacto.
            </p>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#f3eee7]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-serif text-[#2a2a2a]">Histórico de Ensaios</h3>
              <div className="flex gap-2">
                <a 
                  href={clientData.phone ? `https://wa.me/${clientData.phone}?text=Olá ${clientData.full_name?.split(' ')[0] || ''}!` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#25D366]/10 text-[#128C7E] rounded-full flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
                  title="Enviar WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#2a2a2a] text-white px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors"
                >
                  <Calendar size={14} />
                  Novo Agendamento
                </button>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#f3ede4] rounded-3xl">
                <Camera size={32} className="text-[#d1ba8e] mx-auto mb-4 opacity-50" />
                <p className="text-[#a1a1a1] text-sm">Este cliente ainda não realizou nenhum ensaio.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl border border-[#f3eee7] hover:border-[#d1ba8e] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        booking.status === 'pendente' ? 'bg-[#fff8ec] text-[#d1ba8e]' : 'bg-[#fbf7f2] text-[#97816a]'
                      }`}>
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-serif text-[#2a2a2a] group-hover:text-[#97816a] transition-colors">
                          {booking.session_plans?.thematic_sessions?.title || "Ensaio Temático"}
                        </h4>
                        <p className="text-xs text-[#a1a1a1]">
                          {booking.session_plans?.name || "Plano Indefinido"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          booking.status === 'pendente' ? 'bg-[#fff8ec] text-[#d1ba8e]' :
                          booking.status === 'confirmado' ? 'bg-blue-50 text-blue-500' :
                          booking.status === 'fotografado' ? 'bg-purple-50 text-purple-500' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#a1a1a1]">
                        {booking.booking_date ? format(new Date(booking.booking_date), "dd 'de' MMM, yyyy", { locale: ptBR }) : "Data a definir"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClientDetails}
        preselectedClientId={clientId}
        clients={[{ id: clientId, full_name: fullName, phone: phone }]}
        services={services}
        sessions={sessions}
        plans={plans}
      />
    </div>
  );
}
