import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get listings
// O POST foi removido pois usava colunas inexistentes (image_url, ads_count).
// A criação de listings é feita client-side via NewListingModal.tsx.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const userId = searchParams.get('userId')

        const supabase = await createClient()
        let query = supabase
            .from('listings')
            .select(`
                *,
                profiles!inner(id, username, phone, avatar_url),
                listing_images(id, image_url, position)
            `)
            .eq('status', 'active')

        if (category) {
            query = query.eq('category', category)
        }

        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data: listings, error } = await query
            .order('likes_count', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ listings })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
