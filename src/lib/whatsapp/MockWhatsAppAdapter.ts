import { IWhatsAppService, formatPhoneBR } from './WhatsAppService'

export class MockWhatsAppAdapter implements IWhatsAppService {
  /**
   * Helper function to simulate printing the message to the console
   * instead of making an actual HTTP request to an API.
   */
  private async printMock(phone: string, message: string) {
    const formatted = formatPhoneBR(phone)
    const logContent = `\n[${new Date().toLocaleTimeString()}] 📱 Para: +${formatted}\n💬 Mensagem: ${message}\n------------------------------------------------------\n`
    
    console.log('\n======================================================')
    console.log('🤖 [MOCK WHATSAPP] Simulando envio de mensagem:')
    console.log(`📱 Para: +${formatted}`)
    console.log(`💬 Mensagem:\n${message}`)
    console.log('======================================================\n')
    
    // Grava também em um arquivo para o usuário ver no editor
    try {
      const fs = require('fs')
      fs.appendFileSync('whatsapp-logs.txt', logContent)
    } catch (err) {
      console.error('Erro ao gravar log em arquivo:', err)
    }
    
    // Simulate a slight network delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    const message = `Seu código de acesso da Um Mais Um Fotos é: *${code}*\n\nNão compartilhe este código com ninguém.`
    await this.printMock(phone, message)
  }

  async sendFirstAccessLink(phone: string, link: string, clientName: string): Promise<void> {
    const message = `Olá, ${clientName}! 📸\n\nSua galeria na Um Mais Um Fotos está quase pronta.\n\nPara acessar, crie sua senha clicando no link abaixo:\n${link}\n\nSe tiver dúvidas, é só responder esta mensagem!`
    await this.printMock(phone, message)
  }

  async sendTempPassword(phone: string, tempPassword: string): Promise<void> {
    const message = `Sua nova senha temporária é: *${tempPassword}*\n\nRecomendamos que você altere sua senha após o próximo login.`
    await this.printMock(phone, message)
  }

  async sendBookingConfirmationRequest(
    phone: string,
    clientName: string,
    date: string,
    time: string
  ): Promise<void> {
    const message = `Olá, ${clientName}!\n\nPassando para lembrar da nossa sessão marcada para o dia *${date}* às *${time}*.\n\nVocê pode confirmar sua presença respondendo esta mensagem com *CONFIRMAR* ou *CANCELAR*.`
    await this.printMock(phone, message)
  }

  async sendBookingStatusUpdate(
    phone: string,
    clientName: string,
    status: "confirmado" | "cancelado",
    date: string
  ): Promise<void> {
    const message = status === "confirmado" 
      ? `Tudo certo, ${clientName}! Sua sessão do dia *${date}* está confirmada. Te esperamos! 📸`
      : `Poxa, ${clientName}! Sua sessão do dia *${date}* foi cancelada. Qualquer dúvida, estamos à disposição.`
    await this.printMock(phone, message)
  }

  async sendGalleryReady(phone: string, clientName: string, dashboardUrl: string): Promise<void> {
    const message = `Suas fotos estão prontas, ${clientName}! 🎉\n\nAcesse sua galeria pelo link:\n${dashboardUrl}`
    await this.printMock(phone, message)
  }

  async sendAlbumReviewRequest(
    phone: string,
    clientName: string,
    previewUrl: string
  ): Promise<void> {
    const message = `Olá, ${clientName}! A prévia do seu álbum físico já está disponível.\n\nRevise as páginas aqui: ${previewUrl}\n\nResponda esta mensagem com *APROVAR* para iniciarmos a produção ou *REVISAO* se quiser alterar algo.`
    await this.printMock(phone, message)
  }

  async sendAlbumStatusUpdate(
    phone: string,
    clientName: string,
    status: "aprovado" | "em_producao" | "pronto"
  ): Promise<void> {
    let message = ''
    if (status === 'aprovado') message = `Maravilha, ${clientName}! Seu álbum foi aprovado.`
    if (status === 'em_producao') message = `Seu álbum entrou em produção, ${clientName}! Em breve estará em suas mãos.`
    if (status === 'pronto') message = `Ótima notícia, ${clientName}! Seu álbum físico está PRONTO e esperando por você. 📖✨`
    await this.printMock(phone, message)
  }

  async sendThematicSessionLaunch(
    phone: string,
    clientName: string,
    sessionName: string,
    spotsLeft: number,
    landingUrl: string
  ): Promise<void> {
    const message = `🚨 Novo Ensaio Disponível: *${sessionName}*!\n\nOlá, ${clientName}! Abrimos a agenda para nossa sessão especial.\nRestam apenas *${spotsLeft} vagas*.\n\nGaranta a sua: ${landingUrl}`
    await this.printMock(phone, message)
  }

  async sendAlert(phone: string, message: string): Promise<void> {
    const text = `⚠️ *Um Mais Um Fotos*\n\n${message}`
    await this.printMock(phone, message)
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    await this.printMock(to, message)
    return true
  }
}
