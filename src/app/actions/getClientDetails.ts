"use server";

import { createClient } from "@supabase/supabase-js";

export async function getClientDetailsAdmin(clientId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        bookings (
          id,
          status,
          booking_date,
          plan_id,
          service_id,
          scheduled_value,
          realized_value,
          service:services(name),
          session_plans (
            name,
            thematic_sessions (
              title
            )
          )
        )
      `)
      .eq('id', clientId)
      .single();

    if (error) {
      console.error("Erro ao buscar detalhes do cliente via admin:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Erro fatal ao buscar detalhes:", err);
    return { success: false, error: err.message };
  }
}

export async function updateClientAdminAction(clientId: string, updates: any) {
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
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', clientId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao atualizar cliente via admin:", err);
    return { success: false, error: err.message };
  }
}
