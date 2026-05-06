"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NavLinks = [
  { name: "Estúdio", href: "#estudio" },
  { name: "Serviços", href: "#servicos" },
  { name: "Temáticos", href: "#tematicos" },
  { name: "Contato", href: "#contato" },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();

  const supabase = createClient();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const updateScrolled = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", updateScrolled);
    
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      setProfile(data);
    };

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchProfile(user.id);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setProfile(null);
    });

    // Listen for profile changes (realtime)
    const profileChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        if (payload.new.id === user?.id) {
          setProfile(payload.new);
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateScrolled);
      subscription.unsubscribe();
      supabase.removeChannel(profileChannel);
    };
  }, [supabase, user?.id]);

  const navHeight = isMobile 
    ? (scrolled ? 64 : 110) 
    : 140;

  const getInitials = (u: any, p: any) => {
    const name = p?.full_name || u?.user_metadata?.full_name;
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return u?.email?.[0]?.toUpperCase() || '?';
  };

  const UserMenu = ({ align = "right" }: { align?: "left" | "right" }) => (
    <div className="relative">
      <button 
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center gap-2 group p-1"
      >
        {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-cream-dark group-hover:border-primary transition-colors">
            <Image 
              src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
              alt={profile?.full_name || user?.user_metadata?.full_name || 'Usuário'} 
              fill 
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#97816a] flex items-center justify-center border-2 border-cream-dark group-hover:border-primary transition-colors">
            <span className="text-[10px] font-bold text-white tracking-tighter">
              {getInitials(user, profile)}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isUserMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1] bg-black/2 md:bg-transparent" 
              onClick={() => setIsUserMenuOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-dark py-2 z-[110] overflow-hidden",
                align === "right" ? "right-0" : "left-0"
              )}
            >
              <div className="px-4 py-3 border-b border-cream-dark mb-1 bg-[#fbf7f2]/50">
                <div className="flex items-center gap-3 mb-3">
                  {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cream-dark">
                      <Image 
                        src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                        alt={profile?.full_name || user?.user_metadata?.full_name || 'Usuário'} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#97816a] flex items-center justify-center border border-cream-dark">
                      <span className="text-xs font-bold text-white">
                        {getInitials(user, profile)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[#a1a1a1] mb-0.5">Membro</p>
                    <p className="text-sm font-serif text-[#2a2a2a] truncate leading-tight">
                      {profile?.full_name || user?.user_metadata?.full_name || 'Cliente'}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-[#7a7a7a] truncate italic">({user?.email})</p>
              </div>
              <Link 
                href="/dashboard" 
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center px-4 py-3 text-[10px] font-sans tracking-[0.2em] uppercase text-secondary hover:bg-[#fbf7f2] hover:text-primary transition-colors"
              >
                Minha Área
              </Link>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setIsUserMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[10px] font-sans tracking-[0.2em] uppercase text-red-500 hover:bg-red-50 transition-colors border-t border-cream-dark/30"
              >
                Sair
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <LayoutGroup>
      <>
        <div 
          className={cn(
            "fixed left-0 right-0 z-[99] bg-[#fbf7f2] border-b border-cream-dark transition-all duration-500",
            "top-[-100px]"
          )}
          style={{
            height: isMobile 
              ? `calc(100px + ${navHeight}px + env(safe-area-inset-top, 20px))` 
              : `calc(100px + 140px)`
          }}
        />

        <motion.nav
          animate={{ height: navHeight }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[100] w-full",
            "flex flex-col items-center justify-center bg-transparent",
            "px-6 md:px-8 overflow-visible"
          )}
          style={{
            paddingTop: isMobile ? "env(safe-area-inset-top, 20px)" : "0px"
          }}
        >
          <div className="w-full max-w-7xl flex items-center justify-between relative z-10 h-full">
            
            <div className="flex items-center min-w-[40px]">
              <motion.div
                animate={{ 
                  opacity: isMobile && scrolled ? 0 : 1,
                  display: isMobile && scrolled ? "none" : "flex",
                }}
                className="flex items-center"
              >
                <Link href="/" className="flex items-center gap-4 md:gap-8 group">
                  <div className="relative flex-shrink-0">
                    <Image
                      src="/images/logotipo.png"
                      alt="Um Mais Um"
                      width={140}
                      height={140}
                      className="w-[72px] h-[72px] md:w-24 md:h-24 object-contain"
                      priority
                    />
                  </div>
                  
                  <div className="flex flex-col items-start justify-center">
                    <span className="font-serif tracking-tighter leading-none block text-3xl md:text-4xl">
                      <span className="text-[#97816a]">Um</span>
                      <span className="text-[#d1ba8e]">Mais</span>
                      <span className="text-[#97816a]">Um</span>
                    </span>
                    <span className="font-sans tracking-[0.25em] uppercase text-[#675d4d] font-bold w-full text-[9px] md:text-[10px] mt-1 text-center border-t border-transparent">
                      FOTOS  DE  FAMÍLIA
                    </span>
                  </div>
                </Link>
              </motion.div>

              {isMobile && scrolled && (
                <motion.div
                  layoutId="user-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {user ? <UserMenu align="left" /> : (
                    <Link href="/login" className="p-2 text-secondary bg-cream-dark/20 rounded-full">
                      <User size={20} />
                    </Link>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-10">
              <div className="hidden md:flex items-center gap-10">
                {NavLinks.map((link) => {
                  const href = pathname === "/" ? link.href : `/${link.href}`;
                  return (
                    <Link
                      key={link.name}
                      href={href}
                      className="text-sm font-sans tracking-[0.2em] uppercase text-secondary hover:text-primary transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {(!isMobile || !scrolled) && (
                <motion.div
                  layoutId="user-profile"
                  className={cn(
                    "flex items-center",
                    !isMobile ? "border-l border-cream-dark pl-6" : ""
                  )}
                >
                  {user ? <UserMenu align="right" /> : (
                    <Link 
                      href="/login" 
                      className="p-2 text-secondary hover:text-primary transition-colors"
                    >
                      <User size={20} />
                    </Link>
                  )}
                </motion.div>
              )}

              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-secondary active:text-primary bg-cream-dark/30 rounded-full"
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-[#fbf7f2] border-b border-cream-dark shadow-xl md:hidden"
              >
                <div className="flex flex-col px-6 py-4">
                  {NavLinks.map((link) => {
                    const href = pathname === "/" ? link.href : `/${link.href}`;
                    return (
                      <Link
                        key={link.name}
                        href={href}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-sm font-sans tracking-[0.2em] uppercase text-secondary py-4 border-b border-cream-dark/40 last:border-0"
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        <div className={cn(
          isMobile ? "h-[110px]" : "h-[140px]"
        )} />
      </>
    </LayoutGroup>
  );
}
