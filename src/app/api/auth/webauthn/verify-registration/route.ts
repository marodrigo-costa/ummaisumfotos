import { NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { getRpID, getExpectedOrigin } from '../config'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Obter sessão atual
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const expectedChallenge = cookieStore.get('webauthn_challenge')?.value

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expirado ou inválido' }, { status: 400 })
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getExpectedOrigin(request),
      expectedRPID: getRpID(request),
    })

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo
      const { id: credentialID, publicKey: credentialPublicKey, counter } = credential

      const credentialIdBase64 = credentialID
      const publicKeyBuffer = Buffer.from(credentialPublicKey)

      // Salvar no Supabase
      const { error: insertError } = await supabase
        .from('passkeys')
        .insert({
          user_id: session.user.id,
          credential_id: credentialIdBase64,
          public_key: publicKeyBuffer.toString('base64'),
          counter: counter,
          device_type: credentialDeviceType,
          backed_up: credentialBackedUp
        })

      if (insertError) {
        console.error('Erro ao salvar passkey:', insertError)
        return NextResponse.json({ error: 'Erro ao salvar credencial' }, { status: 500 })
      }

      // Limpar o cookie do challenge
      cookieStore.delete('webauthn_challenge')

      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({ verified: false }, { status: 400 })

  } catch (error) {
    console.error('Erro em verify-registration:', error)
    return NextResponse.json({ error: 'Erro ao verificar registro' }, { status: 500 })
  }
}
