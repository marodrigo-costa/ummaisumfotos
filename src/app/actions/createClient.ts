"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function createClientAdmin(prevState: any, formData: FormData) {
  const fullName = formData.get("full_name") as string;
  const phoneRaw = formData.get("phone") as string;

  if (!fullName || !phoneRaw) {
    return { success: false, error: "Nome e telefone são obrigatórios." };
  }

  const phone = phoneRaw.replace(/\D/g, "");

  // Usa o supabase-js PURO para garantir que a Service Role Key seja respeitada
  // Não podemos passar cookies aqui, senão o Supabase rebaixa nossos privilégios
  // para 'authenticated' e bloqueia o upsert no banco via RLS!
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // 1. Cria o usuário na tabela auth.users do Supabase
    // Vamos gerar uma senha aleatória que o usuário nunca vai usar (o login é via magic link/OTP)
    // E usaremos um email fake caso seja necessário para a API (Supabase Auth requer email por padrão na api de admin, 
    // embora tenhamos removido a obrigatoriedade da profiles, a auth.users pode reclamar. Vamos tentar sem email, se falhar, usamos um gerado)
    
    // Auth no supabase normalmente precisa de email ou phone.
    const fakeEmail = `client_${phone}_${Date.now()}@ummaisumfotos.local`;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      phone: phone, // A Meta Cloud API/OTP usa isso
      password: `Pwd!${Math.random().toString(36).slice(-8)}${Date.now()}`,
      email_confirm: true,
      phone_confirm: false, // Pode deixar falso para confirmar depois, ou true
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error("Erro ao criar usuário Auth:", authError);
      
      // Se o erro for de duplicação, vamos tentar buscar o perfil
      if (authError.message.includes('already exists') || authError.code === '23505' || authError.status === 422) {
         return { error: "Este número de telefone já está cadastrado no sistema." };
      }
      
      return { error: "Erro ao criar conta no sistema de autenticação." };
    }

    const userId = authData.user.id;

    // 2. Atualiza a tabela profiles (geralmente criada via trigger pelo Supabase, 
    // mas vamos dar upsert para garantir que o profile existe e preencher os dados)
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        phone: phone,
        is_active: true,
        is_admin: false
      });

    if (profileError) {
      console.error("Erro ao atualizar profile:", profileError);
      return { error: `Conta de login criada, mas erro no perfil: ${profileError.message}` };
    }

    revalidatePath("/admin/clientes");
    return { success: true, clientId: userId };
    
  } catch (err: any) {
    console.error("Erro fatal:", err);
    return { error: err.message || "Erro desconhecido ao cadastrar cliente." };
  }
}
