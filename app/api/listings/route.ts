import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const userId = searchParams.get('userId')
        const status = searchParams.get('status')

        // Build where clause
        const where: any = {}
        if (status) where.status = status
        else if (!userId) where.status = 'active' // Default to active for public feed
        if (category) where.category = category
        if (userId) where.userId = userId

        const listings = await prisma.listing.findMany({
            where,
            include: {
                profile: {
                    select: {
                        id: true,
                        username: true,
                        phone: true,
                        avatarUrl: true
                    }
                },
                images: {
                    orderBy: { position: 'asc' }
                }
            },
            orderBy: [
                { likesCount: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 50
        })

        // Map Prisma camelCase to the snake_case expected by frontend
        const formattedListings = listings.map(l => ({
            ...l,
            user_id: l.userId,
            views_count: l.viewsCount,
            likes_count: l.likesCount,
            whatsapp_clicks: l.whatsappClicks,
            expires_at: l.expiresAt.toISOString(),
            created_at: l.createdAt.toISOString(),
            updated_at: l.updatedAt.toISOString(),
            profile: l.profile ? {
                ...l.profile,
                avatar_url: l.profile.avatarUrl
            } : null,
            listing_images: l.images.map((img: any) => ({
                id: img.id,
                image_url: img.imageUrl,
                position: img.position
            }))
        }))

        return NextResponse.json({ listings: formattedListings })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
