import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  // Skip auth for OAuth callback — no need to call getUser()
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    if (
      !user &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/auth/callback')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user && pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Onboarding redirect: skip for login, callback, and onboarding itself
    if (
      user &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/auth/callback') &&
      !pathname.startsWith('/onboarding')
    ) {
      const onboardingDone = request.cookies.get('onboarding_done')?.value

      if (onboardingDone !== 'true') {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (data && !data.onboarding_completed) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }

        // User has completed onboarding — set cookie to avoid future DB queries
        if (data?.onboarding_completed) {
          supabaseResponse.cookies.set('onboarding_done', 'true', {
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
          })
        }
      }
    }
  } catch {
    if (!request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
