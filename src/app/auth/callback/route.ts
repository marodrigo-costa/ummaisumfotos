import { NextResponse } from 'next/server'
// The client you created in Step 2.
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  const error_description = searchParams.get('error_description')
  const error_name = searchParams.get('error')

  if (error_name || error_description) {
    console.error('Auth Callback URL Error:', { error_name, error_description })
    return NextResponse.redirect(`${origin}/auth/auth-error?error=${error_name}`)
  }

  if (code) {
    const supabase = await createClient()
    console.log('Exchanging code for session...')
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      console.log('Session established for user:', session.user.id)
      // Check if user has already completed onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('agreed_to_terms_at')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError) console.error('Profile Fetch Error:', profileError.message)

      const onboardingComplete = !!profile?.agreed_to_terms_at
      const targetPath = onboardingComplete ? (next === '/' ? '/' : next) : '/onboarding'

      console.log('Redirecting to:', targetPath)
      const response = NextResponse.redirect(`${origin}${targetPath}`)
      return response
    } else {
      console.error('Auth Callback Exchange Error:', error?.message || 'No session returned')
    }
  }

  // Se chegou aqui sem código ou com erro, vai para a página de erro
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
