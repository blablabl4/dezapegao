// NextAuth handles auth callbacks. This legacy Supabase callback is no longer needed.
// Redirecting to home for any stale links.
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(new URL('/', requestUrl.origin))
}
