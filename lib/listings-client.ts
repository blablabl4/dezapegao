// Client-safe listing functions that use API routes instead of Prisma directly
// Use this in 'use client' components instead of '@/lib/listings'

export interface ListingImage {
    id: string
    listing_id: string
    image_url: string
    thumbnail_url: string | null
    position: number
}

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
    likes_count: number
    whatsapp_clicks: number
    status: string
    expires_at: string | null
    created_at: string
    updated_at: string
    images?: ListingImage[]
    profile?: {
        id: string
        username: string
        avatar_url: string | null
        phone: string
    }
    // Legacy compat
    image_url?: string
}

/**
 * Get active listings from API
 */
export async function getActiveListings(): Promise<Listing[]> {
    const res = await fetch('/api/listings?status=active', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.listings || data || []
}

/**
 * Get user's listings from API
 */
export async function getUserListings(userId: string): Promise<Listing[]> {
    const res = await fetch(`/api/listings?userId=${userId}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.listings || data || []
}

/**
 * Delete a listing via API
 */
export async function deleteListing(
    id: string,
    userId: string
): Promise<{ error: Error | null }> {
    try {
        const res = await fetch(`/api/listings/${id}`, {
            method: 'DELETE',
        })
        if (!res.ok) {
            const data = await res.json()
            return { error: new Error(data.error || 'Failed to delete') }
        }
        return { error: null }
    } catch (error: any) {
        return { error }
    }
}
