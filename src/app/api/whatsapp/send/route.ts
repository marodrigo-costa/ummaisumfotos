import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { whatsapp } from "@/lib/whatsapp"

/**
 * Internal WhatsApp Send API
 *
 * Used by admin panel actions to trigger WhatsApp messages.
 * Protected by Supabase session — caller must be authenticated as admin.
 *
 * POST /api/whatsapp/send
 * Body: { type, phone, ...params }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify the caller is an authenticated admin
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Parse request body
  let body: SendRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    await dispatch(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[WhatsApp Send API]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function dispatch(body: SendRequest): Promise<void> {
  switch (body.type) {
    case "otp":
      await whatsapp.sendOtp(body.phone, body.code)
      break

    case "first_access":
      await whatsapp.sendFirstAccessLink(body.phone, body.link, body.clientName)
      break

    case "temp_password":
      await whatsapp.sendTempPassword(body.phone, body.tempPassword)
      break

    case "booking_confirmation_request":
      await whatsapp.sendBookingConfirmationRequest(
        body.phone,
        body.clientName,
        body.date,
        body.time
      )
      break

    case "booking_status_update":
      await whatsapp.sendBookingStatusUpdate(
        body.phone,
        body.clientName,
        body.status,
        body.date
      )
      break

    case "gallery_ready":
      await whatsapp.sendGalleryReady(body.phone, body.clientName, body.dashboardUrl)
      break

    case "album_review_request":
      await whatsapp.sendAlbumReviewRequest(body.phone, body.clientName, body.previewUrl)
      break

    case "album_status_update":
      await whatsapp.sendAlbumStatusUpdate(body.phone, body.clientName, body.status)
      break

    case "thematic_session_launch":
      await whatsapp.sendThematicSessionLaunch(
        body.phone,
        body.clientName,
        body.sessionName,
        body.spotsLeft,
        body.landingUrl
      )
      break

    case "alert":
      await whatsapp.sendAlert(body.phone, body.message)
      break

    default:
      throw new Error(`Unknown message type: ${(body as { type: string }).type}`)
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

type SendRequest =
  | { type: "otp"; phone: string; code: string }
  | { type: "first_access"; phone: string; link: string; clientName: string }
  | { type: "temp_password"; phone: string; tempPassword: string }
  | { type: "booking_confirmation_request"; phone: string; clientName: string; date: string; time: string }
  | { type: "booking_status_update"; phone: string; clientName: string; status: "confirmado" | "cancelado"; date: string }
  | { type: "gallery_ready"; phone: string; clientName: string; dashboardUrl: string }
  | { type: "album_review_request"; phone: string; clientName: string; previewUrl: string }
  | { type: "album_status_update"; phone: string; clientName: string; status: "aprovado" | "em_producao" | "pronto" }
  | { type: "thematic_session_launch"; phone: string; clientName: string; sessionName: string; spotsLeft: number; landingUrl: string }
  | { type: "alert"; phone: string; message: string }
