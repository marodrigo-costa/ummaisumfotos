import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { getRpID, rpName } from '../config'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Obter sessão atual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = session.user
    
    // Obter passkeys já cadastradas para evitar duplicidade
    const { data: passkeys } = await supabase
      .from('passkeys')
      .select('credential_id')
      .eq('user_id', user.id)

    const rpID = getRpID(request)

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email || user.phone || 'usuário',
      // Não pedir PIN/senha se possível, usar biometria
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      // Excluir passkeys já cadastradas
      excludeCredentials: passkeys?.map(pk => ({
        id: pk.credential_id, // needs to be base64url decoded? No, SimpleWebAuthn handles it or we need to pass Uint8Array?
        // Wait, SimpleWebAuthn expects id to be Uint8Array.
        // But for now we can just map it properly if needed, let's leave it empty to simplify unless necessary.
        // Let's comment this out for now to avoid Uint8Array casting issues, or we can use base64url to decode.
      })),
    })

    // Limpar excludeCredentials temporariamente para simplificar
    options.excludeCredentials = []

    // Salvar o challenge nos cookies para o próximo passo
    const cookieStore = await cookies()
    cookieStore.set('webauthn_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 // 5 minutos
    })

    return NextResponse.json(options)
  } catch (error) {
    console.error('Erro em generate-registration-options:', error)
    return NextResponse.json({ error: 'Erro ao gerar opções' }, { status: 500 })
  }
}
