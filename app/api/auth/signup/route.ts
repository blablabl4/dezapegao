import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { email, password, metadata } = await request.json()

        if (!email || !password || !metadata?.username || !metadata?.phone) {
            return NextResponse.json(
                { error: "Dados incompletos para cadastro" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Este email/telefone já está cadastrado" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create User and Profile in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                }
            })

            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    username: metadata.username,
                    email,
                    phone: metadata.phone,
                    gender: metadata.gender || null,
                    city: metadata.city || null,
                    state: metadata.state || null,
                    plan: 'free',
                    status: 'active',
                }
            })

            return { user, profile }
        })

        return NextResponse.json({ success: true, userId: result.user.id })
    } catch (error: any) {
        console.error("Signup error:", error)
        return NextResponse.json(
            { error: error.message || "Erro interno no servidor" },
            { status: 500 }
        )
    }
}
