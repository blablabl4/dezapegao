import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await request.json()
        const userId = (session.user as any).id

        const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: {
                username: data.username,
                avatarUrl: data.avatar_url,
                gender: data.gender,
                birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
                city: data.city,
                state: data.state,
            }
        })

        return NextResponse.json({ success: true, profile: updatedProfile })
    } catch (error) {
        console.error("Profile update error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
