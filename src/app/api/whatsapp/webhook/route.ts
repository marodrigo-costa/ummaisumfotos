import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET!

/**
 * WhatsApp Webhook Handler
 *
 * Receives incoming messages from Evolution API and interprets client responses.
 * Protected by a secret token — only Evolution API can call this endpoint.
 *
 * Supported keywords:
 *   Bookings: CONFIRMAR, CANCELAR
 *   Albums:   APROVAR, REVISAO
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Validate secret token
  const secret = request.headers.get("x-webhook-secret")
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: EvolutionWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Only process incoming text messages
  if (payload.event !== "messages.upsert" || payload.data?.key?.fromMe) {
    return NextResponse.json({ ok: true })
  }

  const rawPhone = payload.data?.key?.remoteJid?.replace("@s.whatsapp.net", "") ?? ""
  const rawText = (
    payload.data?.message?.conversation ??
    payload.data?.message?.extendedTextMessage?.text ??
    ""
  ).trim().toUpperCase()

  if (!rawPhone || !rawText) {
    return NextResponse.json({ ok: true })
  }

  // Normalize phone: remove country code prefix if present
  const phone = rawPhone.startsWith("55") ? rawPhone.slice(2) : rawPhone

  try {
    await handleKeyword(phone, rawText)
  } catch (error) {
    console.error("[Webhook] Error handling keyword:", error)
  }

  return NextResponse.json({ ok: true })
}

async function handleKeyword(phone: string, keyword: string): Promise<void> {
  const supabase = await createClient()

  switch (keyword) {
    case "CONFIRMAR":
      await updateBookingStatus(supabase, phone, "confirmado")
      break

    case "CANCELAR":
      await updateBookingStatus(supabase, phone, "cancelado")
      break

    case "APROVAR":
      await updateAlbumStatus(supabase, phone, "aprovado")
      break

    case "REVISAO":
    case "REVISÃO":
      await updateAlbumStatus(supabase, phone, "em_revisao")
      break

    default:
      // Unknown keyword — ignore silently
      break
  }
}

async function updateBookingStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  phone: string,
  status: "confirmado" | "cancelado"
): Promise<void> {
  // Find the client profile by phone
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle()

  if (!profile) return

  // Find the pending booking for this client
  await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
      client_confirmed_at: status === "confirmado" ? new Date().toISOString() : null,
    })
    .eq("client_id", profile.id)
    .eq("status", "aguardando_confirmacao")
}

async function updateAlbumStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  phone: string,
  status: "aprovado" | "em_revisao"
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle()

  if (!profile) return

  await supabase
    .from("albums")
    .update({
      status,
      updated_at: new Date().toISOString(),
      client_approved_at: status === "aprovado" ? new Date().toISOString() : null,
    })
    .eq("client_id", profile.id)
    .eq("status", "aguardando_aprovacao")
}

// ── Types ──────────────────────────────────────────────────────────────────

interface EvolutionWebhookPayload {
  event: string
  instance: string
  data?: {
    key?: {
      remoteJid?: string
      fromMe?: boolean
      id?: string
    }
    message?: {
      conversation?: string
      extendedTextMessage?: { text?: string }
    }
  }
}
