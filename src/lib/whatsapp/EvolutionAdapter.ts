import { IWhatsAppService, formatPhoneBR } from "./WhatsAppService"

const EVOLUTION_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY!
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME!

/**
 * Evolution API Adapter
 *
 * Implements IWhatsAppService using the Evolution API (unofficial WhatsApp Web wrapper).
 * To migrate to the official Meta Cloud API, replace this file with a MetaAdapter
 * that implements the same interface — no other files need to change.
 */
export class EvolutionAdapter implements IWhatsAppService {
  private async send(phone: string, text: string): Promise<void> {
    const number = formatPhoneBR(phone)

    const res = await fetch(
      `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_KEY,
        },
        body: JSON.stringify({ number, text }),
      }
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Evolution API error ${res.status}: ${body}`)
    }
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    await this.send(
      phone,
      `🔐 *Seu código de acesso é:*\n\n*${code}*\n\nVálido por 10 minutos. Não compartilhe com ninguém.`
    )
  }

  async sendFirstAccessLink(
    phone: string,
    link: string,
    clientName: string
  ): Promise<void> {
    await this.send(
      phone,
      `Olá, *${clientName}*! 👋\n\nSeu acesso ao portal *Um Mais Um Fotos* foi criado.\n\nClique no link abaixo para criar sua senha e acessar suas fotos:\n${link}\n\n_O link expira em 72 horas._`
    )
  }

  async sendTempPassword(phone: string, tempPassword: string): Promise<void> {
    await this.send(
      phone,
      `🔑 *Senha temporária de acesso:*\n\n*${tempPassword}*\n\nUse esta senha para entrar. Você será obrigado(a) a criar uma nova senha no próximo acesso.`
    )
  }

  async sendBookingConfirmationRequest(
    phone: string,
    clientName: string,
    date: string,
    time: string
  ): Promise<void> {
    await this.send(
      phone,
      `📅 Olá, *${clientName}*!\n\nSua sessão fotográfica está agendada para:\n*${date} às ${time}*\n\nPor favor, confirme sua presença respondendo:\n✅ *CONFIRMAR*\n❌ *CANCELAR*`
    )
  }

  async sendBookingStatusUpdate(
    phone: string,
    clientName: string,
    status: "confirmado" | "cancelado",
    date: string
  ): Promise<void> {
    const messages = {
      confirmado: `✅ *Presença confirmada!*\n\nOlá, *${clientName}*! Sua sessão no dia *${date}* está confirmada. Te esperamos! 📸`,
      cancelado: `❌ *Sessão cancelada.*\n\nOlá, *${clientName}*. Sua sessão do dia *${date}* foi cancelada. Para reagendar, entre em contato conosco.`,
    }
    await this.send(phone, messages[status])
  }

  async sendGalleryReady(
    phone: string,
    clientName: string,
    dashboardUrl: string
  ): Promise<void> {
    await this.send(
      phone,
      `📸 *Suas fotos estão prontas!*\n\nOlá, *${clientName}*! Seu ensaio fotográfico já está disponível.\n\nAcesse suas fotos aqui:\n${dashboardUrl}\n\n_As fotos ficam disponíveis por 6 meses._`
    )
  }

  async sendAlbumReviewRequest(
    phone: string,
    clientName: string,
    previewUrl: string
  ): Promise<void> {
    await this.send(
      phone,
      `📖 *Prévia do seu álbum físico*\n\nOlá, *${clientName}*! Preparamos uma prévia do seu álbum.\n\nVisualize aqui: ${previewUrl}\n\nQuando estiver pronto(a), responda:\n✅ *APROVAR* — para aprovar e iniciar a produção\n🔄 *REVISAO* — para solicitar ajustes`
    )
  }

  async sendAlbumStatusUpdate(
    phone: string,
    clientName: string,
    status: "aprovado" | "em_producao" | "pronto"
  ): Promise<void> {
    const messages = {
      aprovado: `✅ *Álbum aprovado!*\n\nOlá, *${clientName}*! Seu álbum foi aprovado e já está sendo produzido. Em breve você receberá uma atualização.`,
      em_producao: `🏭 *Álbum em produção!*\n\nOlá, *${clientName}*! Seu álbum está sendo confeccionado com muito cuidado. Te avisaremos quando estiver pronto.`,
      pronto: `🎉 *Seu álbum está pronto!*\n\nOlá, *${clientName}*! Seu álbum físico foi concluído. Entre em contato para combinar a entrega ou retirada.`,
    }
    await this.send(phone, messages[status])
  }

  async sendThematicSessionLaunch(
    phone: string,
    clientName: string,
    sessionName: string,
    spotsLeft: number,
    landingUrl: string
  ): Promise<void> {
    await this.send(
      phone,
      `✨ *Novo ensaio temático disponível!*\n\nOlá, *${clientName}*!\n\n📸 *${sessionName}*\nRestam apenas *${spotsLeft} vagas*!\n\nSaiba mais e garanta a sua:\n${landingUrl}`
    )
  }

  async sendAlert(phone: string, message: string): Promise<void> {
    await this.send(phone, message)
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      await this.send(to, message)
      return true
    } catch (e) {
      return false
    }
  }
}
