import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being randomly logged out.

  const isPublic = 
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/ensaios') ||
    request.nextUrl.pathname.startsWith('/privacidade') ||
    request.nextUrl.pathname.startsWith('/termos') ||
    request.nextUrl.pathname.startsWith('/manifest') ||
    request.nextUrl.pathname.startsWith('/icon') ||
    request.nextUrl.pathname.startsWith('/apple-icon') ||
    request.nextUrl.pathname.startsWith('/favicon.ico');

  if (isPublic) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    
    // IMPORTANT: Copy over the cookies to the redirect response
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Se o usuário existir e tentar acessar áreas restritas, verifica se a conta está inativa e redireciona conforme papel
  if (user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin'))) {
    const { data: profile } = await supabase.from('profiles').select('is_active, is_admin').eq('id', user.id).single()
    
    if (profile && profile.is_active === false && request.nextUrl.pathname !== '/inativo') {
      const url = request.nextUrl.clone()
      url.pathname = '/inativo'
      
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // Redireciona admins que caírem no dashboard para o admin
    if (profile?.is_admin && request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is. If you're creating a
  // new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.set(...)
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
