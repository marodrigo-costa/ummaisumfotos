import { EvolutionAdapter } from './EvolutionAdapter'
import { ZApiAdapter } from './ZApiAdapter'
import { MockWhatsAppAdapter } from './MockWhatsAppAdapter'
import { IWhatsAppService } from './WhatsAppService'

const provider = process.env.WHATSAPP_PROVIDER || 'zapi'

export const whatsapp: IWhatsAppService = 
  provider === 'mock' ? new MockWhatsAppAdapter() :
  provider === 'evolution' ? new EvolutionAdapter() :
  new ZApiAdapter()
