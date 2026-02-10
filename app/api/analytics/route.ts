import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { listingId, action, userId } = await request.json()

        if (!listingId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Salva o evento na tabela analytics_events (sem race condition)
        // Os contadores podem ser derivados via COUNT() queries quando necessário
        const { error } = await supabase
            .from('analytics_events')
            .insert({
                event_type: action,
                listing_id: listingId,
                user_id: userId || null,
            })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
