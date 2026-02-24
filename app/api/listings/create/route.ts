import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createListing } from "@/lib/listings"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await request.json()
        const userId = (session.user as any).id

        // Use the prisma-powered helper
        const { listing, error } = await createListing(userId, data)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, listing })
    } catch (error: any) {
        console.error("Listing creation error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
