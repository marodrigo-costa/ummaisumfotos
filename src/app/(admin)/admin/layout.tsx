"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  Users, 
  LayoutDashboard, 
  Camera, 
  Sparkles, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Monitor,
  Calendar,
  Globe
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Agendamentos", href: "/admin/agendamentos", icon: Calendar },
  { name: "Clientes", href: "/admin/clientes", icon: Users },
  { name: "Serviços", href: "/admin/servicos", icon: Camera },
  { name: "Temáticos", href: "/admin/tematicos", icon: Sparkles },
  { name: "Site", href: "/admin/landing", icon: Globe },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#97816a] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#97816a] font-serif italic">Validando credenciais de acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7f2] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Desktop - Hidden on Mobile */}
      <aside 
        className={cn(
          "hidden md:flex bg-white border-r border-[#f3eee7] transition-all duration-300 relative z-50 flex-col",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* Espaçamento Superior - Sem Logo */}
        <div className="h-8 md:h-12" />

        {/* Menu Items */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-[#2a2a2a] text-white shadow-lg shadow-black/10" 
                    : "text-[#7a7a7a] hover:bg-[#fbf7f2] hover:text-[#2a2a2a]"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-[#d1ba8e]" : "group-hover:text-[#97816a]")} />
                {isSidebarOpen && (
                  <span className="font-medium text-sm tracking-wide">{item.name}</span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-[#2a2a2a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#fbf7f2]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-[#7a7a7a] hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all duration-200 group"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Sair do Painel</span>}
          </button>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-4 w-full h-8 flex items-center justify-center text-[#d1ba8e] hover:bg-[#fbf7f2] rounded-xl transition-colors hidden md:flex"
          >
            {isSidebarOpen ? <ChevronRight size={16} className="rotate-180" /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header - Mobile Optimized */}
        <header className="h-16 md:h-24 bg-white/80 backdrop-blur-md border-b border-[#f3eee7] flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            {isMobile && (
              <div className="w-8 h-8 bg-[#97816a] rounded-lg flex items-center justify-center text-white font-serif text-sm">
                U
              </div>
            )}
            <div>
              <h1 className="text-base md:text-xl font-serif text-[#2a2a2a]">
                {menuItems.find(item => item.href === pathname)?.name || "Dashboard"}
              </h1>
              <p className="hidden md:block text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold mt-0.5">Gestão Estratégica Um Mais Um</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Header limpo - Apenas o título da seção */}
          </div>
        </header>

        {/* Content Area - Padding adjust for Bottom Nav */}
        <div className={cn(
          "flex-1 overflow-y-auto bg-[#fbf7f2]",
          isMobile ? "p-6 pb-24" : "p-8"
        )}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#f3eee7] flex items-center justify-around px-4 z-[100] pb-safe">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 transition-colors relative",
                    isActive ? "text-[#97816a]" : "text-[#a1a1a1]"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-active"
                      className="absolute -top-1 w-1 h-1 bg-[#97816a] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-1 text-red-400"
            >
              <LogOut size={20} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Sair</span>
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
