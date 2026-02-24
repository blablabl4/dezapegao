import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "Phone",
            credentials: {
                phone: { label: "Phone", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) return null

                const profile = await prisma.profile.findFirst({
                    where: { phone: credentials.phone },
                    include: { user: true }
                })

                if (!profile || !profile.user?.password) return null

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    profile.user.password
                )

                if (!isPasswordCorrect) return null

                return {
                    id: profile.user.id,
                    email: profile.user.email,
                    name: profile.username,
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
            }

            // Fetch profile data to include in token/session
            const profile = await prisma.profile.findFirst({
                where: { userId: token.id as string }
            })

            if (profile) {
                token.username = profile.username
                token.phone = profile.phone
                token.avatarUrl = profile.avatarUrl
                token.plan = profile.plan
            }

            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).username = token.username;
                (session.user as any).phone = token.phone;
                (session.user as any).avatarUrl = token.avatarUrl;
                (session.user as any).plan = token.plan;
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
