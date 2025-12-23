import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create new listing
export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check auth
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user profile to check ads count
        const { data: profile } = await supabase
            .from('profiles')
            .select('ads_count, plan')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Check limits (Free plan = 3 ads/month)
        const adLimits: Record<string, number> = {
            free: 3,
            basic: 10,
            pro: 30,
            premium: 999999,
        }

        const limit = adLimits[profile.plan] || 3

        if (profile.ads_count >= limit) {
            return NextResponse.json(
                { error: 'Limite de anúncios atingido. Faça upgrade do seu plano!' },
                { status: 403 }
            )
        }

        const formData = await request.formData()
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const price = parseFloat(formData.get('price') as string)
        const category = formData.get('category') as string
        const image = formData.get('image') as File

        // Upload image to Supabase Storage
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('listings')
            .upload(fileName, image, {
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            return NextResponse.json(
                { error: 'Erro ao enviar imagem' },
                { status: 500 }
            )
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('listings').getPublicUrl(fileName)

        // Calculate expiration (24h from now)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        // Create listing
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .insert({
                user_id: user.id,
                title,
                description,
                price,
                category,
                image_url: publicUrl,
                expires_at: expiresAt.toISOString(),
                status: 'active',
            })
            .select()
            .single()

        if (listingError) {
            return NextResponse.json(
                { error: listingError.message },
                { status: 500 }
            )
        }

        // Increment user's ads_count
        await supabase
            .from('profiles')
            .update({ ads_count: profile.ads_count + 1 })
            .eq('id', user.id)

        return NextResponse.json({ listing })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// Get listings
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
        profiles!inner(id, username, phone)
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
