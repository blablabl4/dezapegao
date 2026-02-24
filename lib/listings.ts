import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

// Function to map Prisma Listing to App Listing
function mapPrismaToListing(p: any): Listing {
    return {
        id: p.id,
        user_id: p.userId,
        title: p.title,
        description: p.description,
        price: Number(p.price),
        category: p.category,
        cep: p.cep,
        city: p.city,
        state: p.state,
        neighborhood: p.neighborhood,
        status: p.status,
        views_count: p.viewsCount,
        likes_count: p.likesCount,
        whatsapp_clicks: p.whatsappClicks,
        expires_at: p.expiresAt.toISOString(),
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
        images: p.images?.map((img: any) => ({
            id: img.id,
            listing_id: img.listingId,
            image_url: img.imageUrl,
            thumbnail_url: img.thumbnailUrl,
            position: img.position
        })),
        profile: p.profile ? {
            id: p.profile.id,
            username: p.profile.username,
            avatar_url: p.profile.avatarUrl,
            phone: p.profile.phone
        } : undefined
    }
}

// Get active listings for feed
export async function getActiveListings(options?: {
    city?: string
    category?: string
    limit?: number
    offset?: number
}): Promise<Listing[]> {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                status: 'active',
                city: options?.city || undefined,
                category: options?.category || undefined,
            },
            include: {
                images: {
                    orderBy: { position: 'asc' }
                },
                profile: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: options?.limit || 50,
            skip: options?.offset || 0,
        })

        return listings.map(mapPrismaToListing)
    } catch (error) {
        console.error('Error fetching listings:', error)
        return []
    }
}

// Get user's listings (all statuses)
export async function getUserListings(userId: string): Promise<Listing[]> {
    try {
        const listings = await prisma.listing.findMany({
            where: { userId },
            include: {
                images: {
                    orderBy: { position: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return listings.map(mapPrismaToListing)
    } catch (error) {
        console.error('Error fetching user listings:', error)
        return []
    }
}

// Get single listing by ID
export async function getListingById(id: string): Promise<Listing | null> {
    try {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { position: 'asc' }
                },
                profile: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        phone: true
                    }
                }
            }
        })
        return listing ? mapPrismaToListing(listing) : null
    } catch (error) {
        console.error('Error fetching listing:', error)
        return null
    }
}

// Create new listing
export async function createListing(
    userId: string,
    data: CreateListingData
): Promise<{ listing: Listing | null; error: Error | null }> {
    // Calculate expiration (24h for free plan)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    try {
        const listing = await prisma.listing.create({
            data: {
                userId,
                title: data.title,
                description: data.description || null,
                price: new Prisma.Decimal(data.price),
                category: data.category,
                cep: data.cep,
                city: data.city,
                state: data.state,
                neighborhood: data.neighborhood || null,
                expiresAt,
                images: {
                    create: data.image_urls.map((url, index) => ({
                        imageUrl: url,
                        position: index
                    }))
                }
            },
            include: {
                images: true
            }
        })

        return { listing: mapPrismaToListing(listing), error: null }
    } catch (error) {
        console.error('Error creating listing:', error)
        return { listing: null, error: error as Error }
    }
}

// Update listing
export async function updateListing(
    id: string,
    userId: string,
    data: Partial<CreateListingData>
): Promise<{ error: Error | null }> {
    try {
        await prisma.listing.update({
            where: { id, userId },
            data: {
                title: data.title,
                description: data.description,
                price: data.price ? new Prisma.Decimal(data.price) : undefined,
                category: data.category,
                cep: data.cep,
                city: data.city,
                state: data.state,
                neighborhood: data.neighborhood,
            }
        })
        return { error: null }
    } catch (error) {
        console.error('Error updating listing:', error)
        return { error: error as Error }
    }
}

// Mark as sold
export async function markAsSold(id: string, userId: string): Promise<{ error: Error | null }> {
    try {
        await prisma.listing.update({
            where: { id, userId },
            data: { status: 'sold' }
        })
        return { error: null }
    } catch (error) {
        return { error: error as Error }
    }
}

// Delete listing
export async function deleteListing(id: string, userId: string): Promise<{ error: Error | null }> {
    try {
        await prisma.listing.delete({
            where: { id, userId }
        })
        return { error: null }
    } catch (error) {
        return { error: error as Error }
    }
}

// Toggle like
export async function toggleLike(
    listingId: string,
    userId: string
): Promise<{ liked: boolean; error: Error | null }> {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_listingId: {
                    userId,
                    listingId
                }
            }
        })

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            })
            return { liked: false, error: null }
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    listingId
                }
            })
            return { liked: true, error: null }
        }
    } catch (error) {
        return { liked: false, error: error as Error }
    }
}

// Check if user liked a listing
export async function isLiked(listingId: string, userId: string): Promise<boolean> {
    try {
        const like = await prisma.like.findUnique({
            where: {
                userId_listingId: {
                    userId,
                    listingId
                }
            }
        })
        return !!like
    } catch (error) {
        return false
    }
}

// Track analytics event
export async function trackEvent(
    eventType: 'view' | 'whatsapp_click' | 'share',
    listingId: string,
    userId?: string
): Promise<void> {
    try {
        await prisma.analyticsEvent.create({
            data: {
                eventType,
                listingId,
                userId: userId || null
            }
        })

        // Also update counters if necessary (views, whatsapp clicks)
        if (eventType === 'view') {
            await prisma.listing.update({
                where: { id: listingId },
                data: { viewsCount: { increment: 1 } }
            })
        } else if (eventType === 'whatsapp_click') {
            await prisma.listing.update({
                where: { id: listingId },
                data: { whatsappClicks: { increment: 1 } }
            })
        }
    } catch (error) {
        console.error('Error tracking event:', error)
    }
}

// Renew listing (reset expiration)
export async function renewListing(id: string, userId: string): Promise<{ error: Error | null }> {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    try {
        await prisma.listing.update({
            where: { id, userId },
            data: {
                status: 'active',
                expiresAt: expiresAt
            }
        })
        return { error: null }
    } catch (error) {
        return { error: error as Error }
    }
}
