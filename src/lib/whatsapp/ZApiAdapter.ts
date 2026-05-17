import { IWhatsAppService, formatPhoneBR } from './WhatsAppService'

export class ZApiAdapter implements IWhatsAppService {
  private instanceId: string
  private token: string
  private baseUrl: string

  constructor() {
    this.instanceId = process.env.ZAPI_INSTANCE_ID || ''
    this.token = process.env.ZAPI_INSTANCE_TOKEN || ''
    this.baseUrl = `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`
  }

  private async post(endpoint: string, body: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const data = await response.json()
      if (!response.ok) {
        console.error(`Z-API Error (${endpoint}):`, data)
        return false
      }
      return true
    } catch (error) {
      console.error(`Z-API Exception (${endpoint}):`, error)
      return false
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    const phone = formatPhoneBR(to)
    return this.post('send-text', { phone, message })
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    await this.sendMessage(phone, `*Um Mais Um Fotos*\n\nSeu código de acesso é: *${code}*\nValido por 10 minutos.`)
  }

  async sendFirstAccessLink(phone: string, link: string, clientName: string): Promise<void> {
    const message = `Olá, *${clientName}*! Seja bem-vindo(a) à Um Mais Um Fotos.\n\nPara acessar seu painel e ver seus ensaios, clique no link abaixo:\n\n${link}`
    await this.sendMessage(phone, message)
  }

  async sendTempPassword(phone: string, tempPassword: string): Promise<void> {
    await this.sendMessage(phone, `Sua senha temporária é: *${tempPassword}*\nPor favor, altere-a após o login.`)
  }

  async sendBookingConfirmationRequest(phone: string, clientName: string, date: string, time: string): Promise<void> {
    const message = `Olá, *${clientName}*! Você tem um ensaio agendado para o dia *${date}* às *${time}*.\n\nPor favor, responda *CONFIRMAR* ou *CANCELAR*.`
    await this.sendMessage(phone, message)
  }

  async sendBookingStatusUpdate(phone: string, clientName: string, status: "confirmado" | "cancelado", date: string): Promise<void> {
    const message = `Olá, *${clientName}*! Seu agendamento para o dia *${date}* foi *${status.toUpperCase()}*.`
    await this.sendMessage(phone, message)
  }

  async sendGalleryReady(phone: string, clientName: string, dashboardUrl: string): Promise<void> {
    const message = `Boas notícias, *${clientName}*! Suas fotos já estão disponíveis em seu painel:\n\n${dashboardUrl}`
    await this.sendMessage(phone, message)
  }

  async sendAlbumReviewRequest(phone: string, clientName: string, previewUrl: string): Promise<void> {
    const message = `Olá, *${clientName}*! O seu álbum já está pronto para revisão. Veja o preview aqui:\n\n${previewUrl}`
    await this.sendMessage(phone, message)
  }

  async sendAlbumStatusUpdate(phone: string, clientName: string, status: "aprovado" | "em_producao" | "pronto"): Promise<void> {
    const labels = {
      aprovado: "APROVADO",
      em_producao: "EM PRODUÇÃO",
      pronto: "PRONTO PARA RETIRADA"
    }
    await this.sendMessage(phone, `Olá, *${clientName}*! O status do seu álbum mudou para: *${labels[status]}*.`)
  }

  async sendThematicSessionLaunch(phone: string, clientName: string, sessionName: string, spotsLeft: number, landingUrl: string): Promise<void> {
    const message = `Olá, *${clientName}*! Lançamos o novo ensaio temático: *${sessionName}*!\n\nRestam apenas *${spotsLeft}* vagas. Confira e reserve aqui:\n\n${landingUrl}`
    await this.sendMessage(phone, message)
  }

  async sendAlert(phone: string, message: string): Promise<void> {
    await this.sendMessage(phone, message)
  }
}
