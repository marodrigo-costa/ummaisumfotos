import { NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { getRpID, getExpectedOrigin } from '../config'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const cookieStore = await cookies()
    const expectedChallenge = cookieStore.get('webauthn_challenge')?.value

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expirado ou inválido' }, { status: 400 })
    }

    const { id: credentialID } = body

    // Buscar a passkey no banco de dados usando o supabaseAdmin para ignorar RLS
    // porque o usuário não está logado neste momento
    const { data: passkey, error: passkeyError } = await supabaseAdmin
      .from('passkeys')
      .select('*')
      .eq('credential_id', credentialID)
      .single()

    if (passkeyError || !passkey) {
      return NextResponse.json({ error: 'Credencial não encontrada' }, { status: 404 })
    }

    // A publicKey foi salva como base64 string
    const publicKeyBuffer = new Uint8Array(Buffer.from(passkey.public_key, 'base64'))

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: getExpectedOrigin(request),
      expectedRPID: getRpID(request),
      credential: {
        id: passkey.credential_id,
        publicKey: publicKeyBuffer,
        counter: Number(passkey.counter),
        transports: passkey.transports,
      },
    })

    if (verification.verified && verification.authenticationInfo) {
      const { newCounter } = verification.authenticationInfo

      // Atualizar o contador no banco para segurança (proteção contra replay attacks)
      await supabaseAdmin
        .from('passkeys')
        .update({ 
          counter: newCounter,
          last_used_at: new Date().toISOString()
        })
        .eq('id', passkey.id)

      // Limpar o cookie do challenge
      cookieStore.delete('webauthn_challenge')

      // Pegar os dados do usuário para fazer o "login técnico"
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(passkey.user_id)
      
      if (getUserError || !userData.user) {
         return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      }

      const technicalEmail = userData.user.email
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'

      // Atualiza a senha temporária para este acesso
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        passkey.user_id,
        { password: tempPassword }
      )

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao gerar token de acesso' }, { status: 500 })
      }

      // Retorna para o cliente finalizar o signInWithPassword
      return NextResponse.json({ 
        verified: true, 
        email: technicalEmail,
        tempPassword 
      })
    }

    return NextResponse.json({ verified: false }, { status: 400 })

  } catch (error) {
    console.error('Erro em verify-authentication:', error)
    return NextResponse.json({ error: 'Erro ao verificar autenticação' }, { status: 500 })
  }
}
