"use server";

import { createClient } from "@supabase/supabase-js";

export async function getClientsAdmin() {
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
          scheduled_value,
          realized_value
        )
      `)
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Erro ao buscar clientes via admin:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Erro fatal ao buscar clientes:", err);
    return { success: false, error: err.message };
  }
}
