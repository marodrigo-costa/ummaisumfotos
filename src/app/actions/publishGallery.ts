"use server";

import { createClient } from "@supabase/supabase-js";
import { whatsapp } from "@/lib/whatsapp";

export async function publishGallery(bookingId: string, smugmugLink: string) {
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
    // 1. Validar booking e buscar dados
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, profiles(full_name, phone)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Agendamento não encontrado." };
    }

    if (!booking.realized_value || booking.realized_value <= 0) {
      return { success: false, error: "O valor realizado deve ser preenchido antes de disponibilizar." };
    }

    const clientId = booking.client_id;
    const clientName = booking.profiles?.full_name?.split(' ')[0] || "Cliente";
    const clientPhone = booking.profiles?.phone;

    // 2. Atualizar status do booking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'disponibilizado' })
      .eq('id', bookingId);

    if (updateError) {
      return { success: false, error: "Erro ao atualizar status do agendamento." };
    }

    // 3. Inserir na tabela galleries
    const { error: galleryError } = await supabaseAdmin
      .from('galleries')
      .insert({
        booking_id: bookingId,
        client_id: clientId,
        smugmug_link: smugmugLink
      });

    if (galleryError) {
      // Rollback manual do status se a galeria falhar
      await supabaseAdmin.from('bookings').update({ status: booking.status }).eq('id', bookingId);
      return { success: false, error: "Erro ao salvar a galeria." };
    }

    // 4. Disparar WhatsApp se tiver telefone
    if (clientPhone) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ummaisumfotos.com.br';
      const dashboardUrl = `${baseUrl}/dashboard`;
      
      try {
        await whatsapp.sendGalleryReady(clientPhone, clientName, dashboardUrl);
      } catch (waError) {
        console.error("Erro ao enviar WhatsApp:", waError);
        // Não falha a operação principal se o WhatsApp falhar
      }
    }

    // TODO: Implementar Push Notifications no futuro
    
    return { success: true };

  } catch (error: any) {
    console.error("Erro em publishGallery:", error);
    return { success: false, error: error.message || "Erro interno do servidor." };
  }
}
