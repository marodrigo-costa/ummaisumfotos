import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { getRpID } from '../config'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const rpID = getRpID(request)

    // Opções de autenticação, nós não passamos `allowCredentials` porque queremos
    // "Discoverable Credentials" (Passkeys), onde o usuário seleciona a credencial
    // que deseja usar no próprio dispositivo.
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    })

    const cookieStore = await cookies()
    cookieStore.set('webauthn_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 // 5 minutos
    })

    return NextResponse.json(options)
  } catch (error) {
    console.error('Erro em generate-authentication-options:', error)
    return NextResponse.json({ error: 'Erro ao gerar opções' }, { status: 500 })
  }
}
