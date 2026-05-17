import { NextResponse } from 'next/server'
import { whatsapp } from '@/lib/whatsapp'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefone é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Gerar código OTP de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 2. Definir expiração (10 minutos a partir de agora)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // 3. Salvar no Supabase (auth_otps) via cliente Admin
    const { error: dbError } = await supabaseAdmin
      .from('auth_otps')
      .insert([
        { 
          phone, 
          code, 
          expires_at: expiresAt.toISOString() 
        }
      ])

    if (dbError) {
      console.error('Erro ao salvar OTP no banco:', dbError)
      return NextResponse.json(
        { error: 'Erro interno ao processar autenticação' },
        { status: 500 }
      )
    }

    // 4. Disparar via WhatsApp (será o Mock se WHATSAPP_PROVIDER=mock)
    await whatsapp.sendOtp(phone, code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na rota send-otp:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor' },
      { status: 500 }
    )
  }
}
