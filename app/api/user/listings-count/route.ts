import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    try {
        const count = await prisma.listing.count({
            where: {
                userId,
                status: 'active'
            }
        })

        return NextResponse.json({ count })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
