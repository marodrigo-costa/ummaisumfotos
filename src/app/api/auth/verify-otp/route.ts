import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefone e código são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Buscar o OTP mais recente e válido para este telefone
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('auth_otps')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 401 }
      )
    }

    // 2. Marcar OTP como verificado
    await supabaseAdmin
      .from('auth_otps')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', otpData.id)

    // 3. Garantir que o usuário existe no Auth do Supabase
    // Como o provedor de Phone exige Twilio, usaremos um e-mail técnico
    // baseado no telefone para garantir a sessão.
    const technicalEmail = `${phone}@ummaisum.com.br`
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
    
    // Tenta buscar o usuário pelo e-mail técnico
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = userData?.users.find(u => u.email === technicalEmail)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      // Atualiza a senha do usuário existente
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
      )
      
      if (updateError) {
        console.error('Erro ao atualizar senha temporária:', updateError)
        return NextResponse.json({ error: 'Erro ao processar login' }, { status: 500 })
      }
    } else {
      // Cria um novo usuário com o e-mail técnico
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: technicalEmail,
        password: tempPassword,
        email_confirm: true, // Já marcamos como confirmado
        user_metadata: { phone }
      })

      if (createError) {
        console.error('Erro ao criar usuário:', createError)
        return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // 4. Garantir que o perfil existe na tabela public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        phone: phone,
        phone_verified_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Erro ao criar/atualizar perfil:', profileError)
    }

    // 5. Retornar os dados para o cliente realizar o login final
    return NextResponse.json({ 
      success: true, 
      email: technicalEmail,
      tempPassword 
    })

  } catch (error) {
    console.error('Erro na rota verify-otp:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor' },
      { status: 500 }
    )
  }
}
