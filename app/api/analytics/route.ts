import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const { listingId, action } = await request.json()

        if (!listingId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Track WhatsApp clicks
        if (action === 'whatsapp_click') {
            // Get current listing
            const { data: listing } = await supabase
                .from('listings')
                .select('whatsapp_clicks')
                .eq('id', listingId)
                .single()

            if (!listing) {
                return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
            }

            // Increment
            const { error } = await supabase
                .from('listings')
                .update({ whatsapp_clicks: listing.whatsapp_clicks + 1 })
                .eq('id', listingId)

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
