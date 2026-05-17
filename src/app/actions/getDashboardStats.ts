"use server";

import { createClient } from "@supabase/supabase-js";

export async function getDashboardStatsAdmin() {
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
    const [
      { count: clientsCount },
      { count: servicesCount },
      { count: thematicCount },
      { data: bookingsData }
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
      supabaseAdmin.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("thematic_sessions").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("bookings").select("status")
    ]);

    const bookingsList = bookingsData || [];
    const bookingsCounts = {
      scheduled: bookingsList.filter((b: any) => b.status === 'confirmado').length,
      pending: bookingsList.filter((b: any) => b.status === 'pendente').length,
      completed: bookingsList.filter((b: any) => b.status === 'fotografado').length,
      delivered: bookingsList.filter((b: any) => b.status === 'disponibilizado').length
    };

    return { 
      success: true, 
      counts: {
        clients: clientsCount || 0,
        services: servicesCount || 0,
        thematic: thematicCount || 0,
        bookings: bookingsCounts
      }
    };
  } catch (err: any) {
    console.error("Erro fatal ao buscar stats do dashboard:", err);
    return { success: false, error: err.message };
  }
}
