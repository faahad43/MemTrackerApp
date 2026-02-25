import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)'])
const isAuthRoute = createRouteMatcher(['/', '/login(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  
  // If user is logged in and trying to access auth routes (/, /login), redirect to dashboard
  if (userId && isAuthRoute(request)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If user is not logged in and trying to access protected routes, protect them
  if (!userId && !isPublicRoute(request) && !isAuthRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

