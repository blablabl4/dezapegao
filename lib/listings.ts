import { createClient } from '@/lib/supabase/client'

export interface Listing {
    id: string
    user_id: string
    title: string
    description: string | null
    price: number
    category: string
    cep: string
    city: string
    state: string
    neighborhood: string | null
    status: 'active' | 'sold' | 'expired' | 'removed'
    views_count: number
    likes_count: number
    whatsapp_clicks: number
    expires_at: string
    created_at: string
    updated_at: string
    images?: ListingImage[]
    profile?: {
        id: string
        username: string
        avatar_url: string | null
        phone: string
    }
}

export interface ListingImage {
    id: string
    listing_id: string
    image_url: string
    thumbnail_url: string | null
    position: number
}

export interface CreateListingData {
    title: string
    description?: string
    price: number
    category: string
    cep: string
    city: string
    state: string
    neighborhood?: string
    image_urls: string[]
}

// Get active listings for feed
export async function getActiveListings(options?: {
    city?: string
    category?: string
    limit?: number
    offset?: number
}): Promise<Listing[]> {
    const supabase = createClient()

    let query = supabase
        .from('listings')
        .select(`
      *,
      images:listing_images(*),
      profile:profiles(id, username, avatar_url, phone)
    `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50)

    if (options?.city) {
        query = query.eq('city', options.city)
    }

    if (options?.category) {
        query = query.eq('category', options.category)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching listings:', error)
        return []
    }

    return data as Listing[]
}

// Get user's listings (all statuses)
export async function getUserListings(userId: string): Promise<Listing[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('listings')
        .select(`
      *,
      images:listing_images(*)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user listings:', error)
        return []
    }

    return data as Listing[]
}

// Get single listing by ID
export async function getListingById(id: string): Promise<Listing | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('listings')
        .select(`
      *,
      images:listing_images(*),
      profile:profiles(id, username, avatar_url, phone)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching listing:', error)
        return null
    }

    return data as Listing
}

// Create new listing
export async function createListing(
    userId: string,
    data: CreateListingData
): Promise<{ listing: Listing | null; error: Error | null }> {
    const supabase = createClient()

    // Calculate expiration (24h for free plan)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    try {
        // Create listing
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .insert({
                user_id: userId,
                title: data.title,
                description: data.description || null,
                price: data.price,
                category: data.category,
                cep: data.cep,
                city: data.city,
                state: data.state,
                neighborhood: data.neighborhood || null,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single()

        if (listingError) throw listingError

        // Create images
        if (data.image_urls.length > 0) {
            const imageRecords = data.image_urls.map((url, index) => ({
                listing_id: listing.id,
                image_url: url,
                position: index,
            }))

            const { error: imagesError } = await supabase
                .from('listing_images')
                .insert(imageRecords)

            if (imagesError) {
                console.error('Error creating images:', imagesError)
            }
        }

        return { listing: listing as Listing, error: null }
    } catch (error) {
        return { listing: null, error: error as Error }
    }
}

// Update listing
export async function updateListing(
    id: string,
    userId: string,
    data: Partial<CreateListingData>
): Promise<{ error: Error | null }> {
    const supabase = createClient()

    try {
        const updateData: any = {}
        if (data.title) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description
        if (data.price) updateData.price = data.price
        if (data.category) updateData.category = data.category
        if (data.cep) updateData.cep = data.cep
        if (data.city) updateData.city = data.city
        if (data.state) updateData.state = data.state
        if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood

        const { error } = await supabase
            .from('listings')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)

        if (error) throw error

        return { error: null }
    } catch (error) {
        return { error: error as Error }
    }
}

// Mark as sold
export async function markAsSold(id: string, userId: string): Promise<{ error: Error | null }> {
    const supabase = createClient()

    const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', id)
        .eq('user_id', userId)

    return { error: error as Error | null }
}

// Delete listing
export async function deleteListing(id: string, userId: string): Promise<{ error: Error | null }> {
    const supabase = createClient()

    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    return { error: error as Error | null }
}

// Toggle like
export async function toggleLike(
    listingId: string,
    userId: string
): Promise<{ liked: boolean; error: Error | null }> {
    const supabase = createClient()

    // Check if already liked
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', userId)
        .single()

    try {
        if (existingLike) {
            // Remove like
            await supabase
                .from('likes')
                .delete()
                .eq('listing_id', listingId)
                .eq('user_id', userId)

            return { liked: false, error: null }
        } else {
            // Add like
            await supabase
                .from('likes')
                .insert({ listing_id: listingId, user_id: userId })

            return { liked: true, error: null }
        }
    } catch (error) {
        return { liked: false, error: error as Error }
    }
}

// Check if user liked a listing
export async function isLiked(listingId: string, userId: string): Promise<boolean> {
    const supabase = createClient()

    const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', userId)
        .single()

    return !!data
}

// Track analytics event
export async function trackEvent(
    eventType: 'view' | 'whatsapp_click' | 'share',
    listingId: string,
    userId?: string
): Promise<void> {
    const supabase = createClient()

    await supabase
        .from('analytics_events')
        .insert({
            event_type: eventType,
            listing_id: listingId,
            user_id: userId || null,
        })

    // Also increment counter on listing
    if (eventType === 'view') {
        await supabase.rpc('increment_counter', {
            listing_id: listingId,
            column_name: 'views_count'
        })
    } else if (eventType === 'whatsapp_click') {
        await supabase.rpc('increment_counter', {
            listing_id: listingId,
            column_name: 'whatsapp_clicks'
        })
    }
}

// Renew listing (reset expiration)
export async function renewListing(id: string, userId: string): Promise<{ error: Error | null }> {
    const supabase = createClient()

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const { error } = await supabase
        .from('listings')
        .update({
            status: 'active',
            expires_at: expiresAt.toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)

    return { error: error as Error | null }
}
