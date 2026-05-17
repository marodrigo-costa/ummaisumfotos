/**
 * WhatsApp Service Interface
 *
 * Abstraction layer for WhatsApp messaging.
 * All application code must use this interface — never call Evolution API directly.
 * To migrate to the official Meta API in the future, only the adapter needs to change.
 */

export interface IWhatsAppService {
  /**
   * Send a one-time password (OTP) for authentication.
   * Expires in 10 minutes.
   */
  sendOtp(phone: string, code: string): Promise<void>

  /**
   * Send first-access link when the studio registers a new client.
   * Token expires in 72 hours.
   */
  sendFirstAccessLink(phone: string, link: string, clientName: string): Promise<void>

  /**
   * Send a temporary password for password recovery.
   * Client must change it on next login.
   */
  sendTempPassword(phone: string, tempPassword: string): Promise<void>

  /**
   * Send a booking confirmation request.
   * Client should reply CONFIRMAR or CANCELAR.
   */
  sendBookingConfirmationRequest(
    phone: string,
    clientName: string,
    date: string,
    time: string
  ): Promise<void>

  /**
   * Send a booking status update notification.
   */
  sendBookingStatusUpdate(
    phone: string,
    clientName: string,
    status: "confirmado" | "cancelado",
    date: string
  ): Promise<void>

  /**
   * Notify client that their photo gallery is ready.
   */
  sendGalleryReady(phone: string, clientName: string, dashboardUrl: string): Promise<void>

  /**
   * Send album review request.
   * Client should reply APROVAR or REVISAO.
   */
  sendAlbumReviewRequest(
    phone: string,
    clientName: string,
    previewUrl: string
  ): Promise<void>

  /**
   * Send album status update.
   */
  sendAlbumStatusUpdate(
    phone: string,
    clientName: string,
    status: "aprovado" | "em_producao" | "pronto"
  ): Promise<void>

  /**
   * Broadcast a thematic session launch to opted-in clients.
   */
  sendThematicSessionLaunch(
    phone: string,
    clientName: string,
    sessionName: string,
    spotsLeft: number,
    landingUrl: string
  ): Promise<void>

  /**
   * Generic alert for custom messages.
   */
  sendAlert(phone: string, message: string): Promise<void>

  /**
   * Low-level send message.
   */
  sendMessage(to: string, message: string): Promise<boolean>
}

/**
 * Formats a Brazilian phone number to the international format expected by Evolution API.
 * Input:  "(14) 99824-6404" or "14998246404"
 * Output: "5514998246404"
 */
export function formatPhoneBR(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  // Already has country code
  if (digits.startsWith("55") && digits.length >= 12) return digits
  return `55${digits}`
}
