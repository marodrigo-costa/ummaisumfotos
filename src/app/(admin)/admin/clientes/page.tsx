"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  UserPlus, 
  Phone, 
  Calendar, 
  AlertCircle,
  MoreVertical,
  Loader2,
  Lock,
  X,
  Save,
  Shield,
  Trash2,
  ExternalLink,
  DollarSign
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClientAdmin } from "@/app/actions/createClient";
import { getClientsAdmin } from "@/app/actions/getClients";

// SVG real do WhatsApp
function WhatsAppIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#25D366"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23.5 8.5C21.5 6.5 18.9 5.4 16.1 5.4C10.3 5.4 5.6 10.1 5.6 15.9C5.6 17.8 6.1 19.6 7 21.2L5.5 26.6L11.1 25.1C12.6 25.9 14.3 26.4 16.1 26.4C21.9 26.4 26.6 21.7 26.6 15.9C26.6 13.1 25.5 10.5 23.5 8.5ZM16.1 24.5C14.5 24.5 12.9 24.1 11.5 23.2L11.2 23L7.9 23.9L8.8 20.7L8.5 20.4C7.5 18.9 7 17.4 7 15.9C7 11 11.2 6.9 16.2 6.9C18.6 6.9 20.8 7.9 22.5 9.5C24.1 11.2 25.1 13.4 25.1 15.9C25.1 20.8 20.9 24.5 16.1 24.5ZM20.8 18.1C20.5 18 19.1 17.3 18.8 17.2C18.6 17.1 18.4 17.1 18.3 17.3C18.1 17.6 17.6 18.2 17.4 18.4C17.3 18.6 17.1 18.6 16.9 18.5C16.1 18.1 15.4 17.7 14.8 17.1C14.3 16.5 13.9 15.9 13.5 15.2C13.4 15 13.5 14.8 13.6 14.7C13.7 14.6 13.9 14.4 14 14.3C14.1 14.2 14.2 14 14.2 13.9C14.3 13.8 14.2 13.6 14.2 13.5C14.1 13.4 13.7 12.4 13.5 12C13.3 11.6 13.1 11.6 12.9 11.6H12.5C12.3 11.6 12 11.7 11.8 11.9C11.5 12.2 10.9 12.8 10.9 14C10.9 15.2 11.8 16.3 11.9 16.5C12 16.6 13.7 19.2 16.3 20.3C18.1 21.1 18.9 21.1 19.8 21C20.4 20.9 21.5 20.4 21.7 19.8C21.9 19.2 21.9 18.7 21.8 18.6C21.7 18.4 21.5 18.3 20.8 18.1Z" fill="white"/>
    </svg>
  );
}

export default function AdminClientesPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New client modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Context menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const result = await getClientsAdmin();
      if (result.success && result.data) {
        setClients(result.data);
      } else {
        toast.error("Erro ao carregar lista de clientes.");
      }
    } catch (error) {
      console.error("Erro fatal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClient() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(`${deleteTarget.name} removido com sucesso.`);
      setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(`Erro ao excluir: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const rawTerm = term.replace(/\D/g, "");
    const nameMatch = client.full_name?.toLowerCase().includes(term);
    const phoneMatch = client.phone?.includes(rawTerm && rawTerm.length > 0 ? rawTerm : term);
    return nameMatch || phoneMatch;
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) {
      toast.error("Preencha nome e telefone.");
      return;
    }
    setIsCreating(true);
    const formData = new FormData();
    formData.append("full_name", newClientName);
    formData.append("phone", newClientPhone);
    const result = await createClientAdmin(null, formData);
    setIsCreating(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Cliente criado com sucesso!");
      setIsModalOpen(false);
      setNewClientName("");
      setNewClientPhone("");
      fetchClients();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-[#2a2a2a] mb-2">Clientes</h2>
          <p className="text-sm text-[#675d4d]">Gerencie sua carteira de clientes e agendamentos.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#e8dfd2] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20 focus:border-[#97816a] transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2a2a2a] text-white px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors shrink-0"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-[#97816a]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => {
            const bookings = client.bookings || [];
            const totalBookings = bookings.length;
            const pendingBookings = bookings.filter((b: any) => b.status === 'pendente').length;
            const hasPending = pendingBookings > 0;
            const isInactive = client.is_active === false;
            const isAdmin = client.is_admin === true;
            const scheduledTotal = bookings.reduce((acc: number, b: any) => acc + (b.scheduled_value || 0), 0);
            const realizedTotal = bookings.reduce((acc: number, b: any) => acc + (b.realized_value || 0), 0);
            const waLink = client.phone
              ? `https://wa.me/${client.phone.replace(/\D/g, '')}?text=Olá ${client.full_name?.split(' ')[0] || ''}, tudo bem? Aqui é do estúdio Um Mais Um Fotos!`
              : '#';

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white rounded-[2rem] p-6 shadow-sm border transition-all ${
                  isAdmin
                    ? 'border-[#97816a]/40 bg-[#fbf7f2]'
                    : hasPending 
                      ? 'border-[#d1ba8e] shadow-[#d1ba8e]/10' 
                      : isInactive 
                        ? 'border-red-100 bg-red-50/30 opacity-75' 
                        : 'border-[#f3eee7] hover:border-[#e8dfd2]'
                }`}
              >
                {/* Admin Badge */}
                {isAdmin && (
                  <div className="absolute -top-3 -right-3 bg-[#2a2a2a] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Shield size={10} />
                    Admin
                  </div>
                )}

                {/* Pending Badge */}
                {hasPending && !isInactive && !isAdmin && (
                  <div className="absolute -top-3 -right-3 bg-[#d1ba8e] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <AlertCircle size={12} />
                    Pendente
                  </div>
                )}

                {/* Inactive Badge */}
                {isInactive && (
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Lock size={12} />
                    Inativo
                  </div>
                )}

                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#f3ede4] flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                      {client.avatar_url ? (
                        <Image 
                          src={client.avatar_url} 
                          alt={client.full_name || "Cliente"} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl font-serif text-[#97816a]">
                          {client.full_name ? client.full_name.charAt(0).toUpperCase() : "?"}
                        </span>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg text-[#2a2a2a] truncate leading-tight mb-1">
                        {client.full_name || "Cliente sem nome"}
                      </h3>
                      <p className="text-xs text-[#a1a1a1] flex items-center gap-1 font-mono">
                        <Phone size={12} />
                        {client.phone ? `+${client.phone}` : "Sem telefone"}
                      </p>
                    </div>
                  </div>

                  {/* Context Menu */}
                  <div className="relative" ref={openMenuId === client.id ? menuRef : null}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                      className="p-2 hover:bg-[#f3eee7] rounded-full text-[#a1a1a1] transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    <AnimatePresence>
                      {openMenuId === client.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-[#f3eee7] z-20 overflow-hidden py-1"
                        >
                          <Link
                            href={`/admin/clientes/${client.id}`}
                            onClick={() => setOpenMenuId(null)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2a2a2a] hover:bg-[#fbf7f2] transition-colors"
                          >
                            <ExternalLink size={15} className="text-[#97816a]" />
                            Ver Detalhes
                          </Link>
                          {client.phone && !isInactive && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setOpenMenuId(null)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2a2a2a] hover:bg-[#fbf7f2] transition-colors"
                            >
                              <WhatsAppIcon size={15} />
                              Abrir WhatsApp
                            </a>
                          )}
                          <div className="my-1 border-t border-[#f3eee7]" />
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeleteTarget({ id: client.id, name: client.full_name || "Cliente" });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={15} />
                            Excluir Cliente
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-[#fbf7f2] rounded-2xl p-4 mb-5 space-y-3">
                  {/* Ensaios */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#675d4d]">
                      <Calendar size={14} className="text-[#97816a]" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Ensaios</span>
                    </div>
                    <span className="font-serif text-lg text-[#2a2a2a]">{totalBookings}</span>
                  </div>

                  {/* Financeiro */}
                  {totalBookings > 0 && (
                    <div className="border-t border-[#f3eee7] pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] text-[#a1a1a1] uppercase tracking-widest font-bold mb-0.5">Previsto</p>
                        <p className="text-sm font-serif text-[#2a2a2a]">
                          R$ {scheduledTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#a1a1a1] uppercase tracking-widest font-bold mb-0.5">Realizado</p>
                        <p className={`text-sm font-serif ${realizedTotal > 0 ? 'text-emerald-600' : 'text-[#a1a1a1]'}`}>
                          R$ {realizedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="bg-white border border-[#e8dfd2] text-[#2a2a2a] py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-center hover:bg-gray-50 transition-colors"
                  >
                    Detalhes
                  </Link>
                  <a 
                    href={client.phone && !isInactive ? waLink : '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-center transition-colors flex items-center justify-center gap-2 ${
                      client.phone && !isInactive
                        ? 'bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20'
                        : 'bg-gray-100 text-gray-400 pointer-events-none'
                    }`}
                  >
                    <WhatsAppIcon size={14} />
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            );
          })}

          {filteredClients.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-[#fbf7f2] rounded-full flex items-center justify-center text-[#d1ba8e] mx-auto mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-serif text-[#2a2a2a] mb-2">Nenhum cliente encontrado</h3>
              <p className="text-sm text-[#a1a1a1]">Tente buscar por outro nome ou número de telefone.</p>
            </div>
          )}
        </div>
      )}

      {/* New Client Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCreating && setIsModalOpen(false)}
              className="fixed inset-0 bg-[#2a2a2a]/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden border border-[#f3eee7]"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif text-[#2a2a2a]">Novo Cliente</h3>
                  <button 
                    onClick={() => !isCreating && setIsModalOpen(false)}
                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateClient} className="space-y-5">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#675d4d] mb-2 ml-4">Nome Completo</label>
                    <input 
                      type="text" 
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Ex: Maria Clara"
                      disabled={isCreating}
                      required
                      className="w-full px-5 py-3 bg-[#fbf7f2] border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20 focus:border-[#97816a] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#675d4d] mb-2 ml-4">WhatsApp</label>
                    <input 
                      type="tel" 
                      value={newClientPhone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 11) value = value.slice(0, 11);
                        if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                        if (value.length > 10) value = `${value.slice(0, 10)}-${value.slice(10)}`;
                        setNewClientPhone(value);
                      }}
                      placeholder="(11) 99999-8888"
                      disabled={isCreating}
                      required
                      className="w-full px-5 py-3 bg-[#fbf7f2] border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#97816a]/20 focus:border-[#97816a] transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-[#2a2a2a] text-white py-4 mt-4 rounded-full font-bold tracking-widest text-[10px] uppercase hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Cadastrar Cliente
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteTarget(null)}
              className="fixed inset-0 bg-[#2a2a2a]/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden border border-red-100"
            >
              <div className="p-8">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-serif text-[#2a2a2a] text-center mb-2">Excluir Cliente</h3>
                <p className="text-sm text-[#a1a1a1] text-center mb-8">
                  Tem certeza que deseja excluir <strong className="text-[#2a2a2a]">{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={isDeleting}
                    className="py-3 rounded-full border border-[#e8dfd2] text-[#2a2a2a] text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteClient}
                    disabled={isDeleting}
                    className="py-3 rounded-full bg-red-500 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
