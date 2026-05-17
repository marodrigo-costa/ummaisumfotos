"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PhoneInputForm } from "@/components/auth/PhoneInputForm";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import { BiometricPrompt } from "@/components/auth/BiometricPrompt";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Check } from "lucide-react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

type LoginState = "phone" | "otp" | "onboarding" | "biometric";

const supabase = createClient();

export default function LoginPage() {
  const [state, setState] = useState<LoginState>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
 
   useEffect(() => {
     if (state === "biometric") {
       const checkSupport = async () => {
         // Detecta se é dispositivo móvel
         const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
         
         if (!isMobile) {
           handleBiometricDecline();
           return;
         }

         if (typeof window !== "undefined" && window.PublicKeyCredential) {
           try {
             const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
             if (!available) {
               handleBiometricDecline();
             }
           } catch (err) {
             handleBiometricDecline();
           }
         } else {
           handleBiometricDecline();
         }
       };
       
       checkSupport();
     }
   }, [state]);

  const handlePhoneSubmit = async (submittedPhone: string) => {
    setIsLoading(true);
    setError(null);
    setPhone(submittedPhone);
    
    try {
       const response = await fetch('/api/auth/send-otp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone: submittedPhone }),
       });
 
       const data = await response.json();
 
       if (!response.ok) {
         throw new Error(data.error || 'Erro ao enviar código');
       }
 
       setState("otp");
     } catch (err: any) {
       setError(err.message);
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleOtpSubmit = async (otp: string) => {
     setIsLoading(true);
     setError(null);
 
     try {
       const response = await fetch('/api/auth/verify-otp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone, code: otp }),
       });
 
       const data = await response.json();
 
       if (!response.ok) {
         throw new Error(data.error || 'Código inválido');
       }
 
       // Agora fazemos o login oficial no Supabase usando a senha temporária
       // Usaremos o e-mail técnico retornado pela API para evitar bloqueios de provider
       const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
         email: data.email,
         password: data.tempPassword,
       });
 
       if (signInError) {
         console.error('Erro no signInWithPassword:', signInError);
         throw new Error('Erro ao estabelecer sessão técnica.');
       }

       const user = signInData?.user;
       if (!user) {
         throw new Error('Usuário não retornado após autenticação.');
       }
 
       // 4. Verificar se o usuário já tem nome
       const { data: profileData } = await supabase
         .from('profiles')
         .select('full_name, is_admin')
         .eq('id', user.id)
         .single();
 
       setProfile(profileData);

       if (!profileData?.full_name || profileData.full_name === 'Cliente') {
         setState("onboarding");
       } else {
         setState("biometric");
       }
     } catch (err: any) {
       setError(err.message);
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleOnboardingSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!fullName.trim()) return;
 
     setIsLoading(true);
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error("Sessão expirada ou não encontrada.");

       const { error: updateError } = await supabase
         .from('profiles')
         .update({ full_name: fullName.trim() })
         .eq('id', user.id);
 
       if (updateError) throw updateError;
       
       setProfile((prev: any) => ({
         ...prev,
         full_name: fullName.trim(),
       }));

       setState("biometric");
     } catch (err: any) {
       setError("Erro ao salvar nome. Tente novamente.");
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleOtpResend = async () => {
     setIsLoading(true);
     setError(null);
     try {
       const response = await fetch('/api/auth/send-otp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone }),
       });
 
       if (!response.ok) {
         throw new Error('Erro ao reenviar código');
       }
       
       // Opcional: mostrar um alerta de "Código reenviado"
     } catch (err: any) {
       setError(err.message);
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleBiometricAccept = async () => {
     setIsLoading(true);
     try {
       // 1. Obter opções de registro do backend
       const optionsResp = await fetch('/api/auth/webauthn/generate-registration-options');
       const optionsData = await optionsResp.json();

       if (!optionsResp.ok) throw new Error(optionsData.error || 'Erro ao gerar opções biométricas');

       // 2. Chamar o prompt nativo (Face ID / Touch ID)
       const attResp = await startRegistration(optionsData);

       // 3. Enviar a resposta para o backend validar e salvar
       const verificationResp = await fetch('/api/auth/webauthn/verify-registration', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(attResp),
       });

       const verificationData = await verificationResp.json();
       
       if (!verificationData.verified) {
         throw new Error('Falha na validação biométrica');
       }

       // Redirecionamento em caso de sucesso
       if (profile?.is_admin) {
         router.push("/admin");
       } else {
         router.push("/dashboard");
       }

     } catch (err: any) {
       console.error('Erro na biometria:', err);
       // Se o usuário cancelar a biometria, não bloqueamos o acesso,
       // apenas redirecionamos normalmente (ele usará o login OTP na próxima)
       if (profile?.is_admin) {
         router.push("/admin");
       } else {
         router.push("/dashboard");
       }
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleBiometricDecline = async () => {
     let isAdmin = profile?.is_admin;
     
     if (isAdmin === undefined) {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
         const { data: profileData } = await supabase
           .from('profiles')
           .select('is_admin')
           .eq('id', user.id)
           .single();
         isAdmin = profileData?.is_admin;
       }
     }

     if (isAdmin) {
       router.push("/admin");
     } else {
       router.push("/dashboard");
     }
   };

   const handleBiometricLogin = async () => {
     setIsLoading(true);
     setError(null);
     
     try {
       // 1. Pede o desafio de autenticação pro backend
       const optionsResp = await fetch('/api/auth/webauthn/generate-authentication-options');
       const optionsData = await optionsResp.json();

       if (!optionsResp.ok) throw new Error(optionsData.error || 'Erro ao preparar login biométrico');

       // 2. Aciona o prompt biométrico do sistema operacional
       const asseResp = await startAuthentication(optionsData);

       // 3. Valida a resposta no backend
       const verificationResp = await fetch('/api/auth/webauthn/verify-authentication', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(asseResp),
       });

       const verificationData = await verificationResp.json();

       if (!verificationResp.ok || !verificationData.verified) {
         throw new Error(verificationData.error || 'Autenticação biométrica falhou');
       }

       // 4. Efetuar o login silencioso no Supabase usando a senha técnica retornada
       const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
         email: verificationData.email,
         password: verificationData.tempPassword,
       });

       if (signInError) throw new Error('Erro ao estabelecer sessão após biometria');

       const user = signInData.user;
       
       // Checar admin
       const { data: profileData } = await supabase
         .from('profiles')
         .select('is_admin')
         .eq('id', user.id)
         .single();
         
       if (profileData?.is_admin) {
         router.push("/admin");
       } else {
         router.push("/dashboard");
       }

     } catch (err: any) {
       console.error('Login biométrico:', err);
       setError('A biometria falhou ou foi cancelada. Tente com seu número de WhatsApp.');
     } finally {
       setIsLoading(false);
     }
   };

  return (
    <div className="min-h-screen bg-[#fbf7f2] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#f3ede4] blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#f3ede4] blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/20 relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="flex flex-col items-center mb-6 group">
            <div className="relative w-24 h-24 mb-2">
              <Image
                src="/images/logotipo.png"
                alt="Um Mais Um"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-serif tracking-tighter leading-none block text-xl">
                <span className="text-[#97816a]">Um</span>
                <span className="text-[#d1ba8e]">Mais</span>
                <span className="text-[#97816a]">Um</span>
              </span>
              <span className="font-sans tracking-[0.2em] uppercase text-[#675d4d] font-bold text-[7px] mt-1">
                FOTOS  DE  FAMÍLIA
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-serif text-[#2a2a2a] mb-2">Seja bem-vindo</h1>
          <p className="text-[#7a7a7a] font-light">
            {state === "biometric" 
              ? "Login realizado com sucesso."
              : "Reviva os momentos mais especiais da sua família."}
          </p>
        </div>

        {/* Espaço para as telas de auth com altura equilibrada */}
        <div className="relative h-[500px]">
          <AnimatePresence mode="wait">
            {state === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                <PhoneInputForm 
                  onSubmit={handlePhoneSubmit}
                  isLoading={isLoading}
                  error={error}
                  onBiometricLogin={handleBiometricLogin}
                />
              </motion.div>
            )}

            {state === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                <OtpVerifyForm 
                  phone={phone}
                  onSubmit={handleOtpSubmit}
                  onResend={handleOtpResend}
                  onChangePhone={() => setState("phone")}
                  isLoading={isLoading}
                  error={error}
                />
              </motion.div>
            )}

            {state === "onboarding" && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#f3ede4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-[#97816a] w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-serif text-[#2a2a2a] mb-2">Bem-vindo!</h2>
                  <p className="text-sm text-[#7a7a7a]">Como podemos te chamar?</p>
                </div>

                <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#f9f9f9] border-none text-[#2a2a2a] py-4 px-6 rounded-2xl focus:ring-2 focus:ring-[#2a2a2a] outline-none transition-all text-lg font-medium"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !fullName.trim()}
                    className="w-full bg-[#97816a] text-white py-4 rounded-2xl font-medium hover:bg-[#86725e] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-40"
                  >
                    {isLoading ? "Salvando..." : "Continuar"}
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {state === "biometric" && (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="absolute w-full flex flex-col justify-center"
              >
                <BiometricPrompt 
                  onAccept={handleBiometricAccept}
                  onDecline={handleBiometricDecline}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
