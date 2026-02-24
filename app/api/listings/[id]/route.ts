import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET single listing
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const listing = await prisma.listing.findUnique({
            where: { id },
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
            }
        })

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 })
        }

        // Map to snake_case for frontend
        const formatted = {
            ...listing,
            user_id: listing.userId,
            views_count: listing.viewsCount,
            likes_count: listing.likesCount,
            whatsapp_clicks: listing.whatsappClicks,
            expires_at: listing.expiresAt.toISOString(),
            created_at: listing.createdAt.toISOString(),
            updated_at: listing.updatedAt.toISOString(),
            profile: listing.profile ? {
                ...listing.profile,
                avatar_url: listing.profile.avatarUrl
            } : null,
            listing_images: listing.images.map((img: any) => ({
                id: img.id,
                image_url: img.imageUrl,
                position: img.position
            }))
        }

        return NextResponse.json({ listing: formatted })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH update listing
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await request.json()
        const userId = (session.user as any).id

        // Ensure user owns the listing
        const existing = await prisma.listing.findUnique({
            where: { id }
        })

        if (!existing || existing.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const updated = await prisma.listing.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                category: data.category,
                cep: data.cep,
                city: data.city,
                state: data.state,
                neighborhood: data.neighborhood,
                status: data.status,
            }
        })

        return NextResponse.json({ success: true, listing: updated })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE listing
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const userId = (session.user as any).id

        // Ensure user owns the listing
        const existing = await prisma.listing.findUnique({
            where: { id }
        })

        if (!existing || existing.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.listing.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
