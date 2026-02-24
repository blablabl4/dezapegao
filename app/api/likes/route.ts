import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

// GET: check if user liked a listing
export async function GET(request: NextRequest) {
    const listingId = request.nextUrl.searchParams.get('listingId')
    const userId = request.nextUrl.searchParams.get('userId')

    if (!listingId || !userId) {
        return NextResponse.json({ liked: false })
    }

    try {
        const like = await prisma.like.findFirst({
            where: { listingId, userId }
        })
        return NextResponse.json({ liked: !!like })
    } catch {
        return NextResponse.json({ liked: false })
    }
}

// POST: toggle like
export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { listingId, action } = await request.json()
        const userId = (session.user as any).id

        if (action === 'unlike') {
            await prisma.like.deleteMany({
                where: { listingId, userId }
            })
            await prisma.listing.update({
                where: { id: listingId },
                data: { likesCount: { decrement: 1 } }
            })
        } else {
            await prisma.like.create({
                data: { listingId, userId }
            })
            await prisma.listing.update({
                where: { id: listingId },
                data: { likesCount: { increment: 1 } }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
