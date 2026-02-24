'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { logger } from '@/lib/logger'

interface Profile {
    id: string
    username: string
    email: string
    phone: string
    avatar_url: string | null
    gender: string | null
    birthdate: string | null
    plan: 'free' | 'basic' | 'pro' | 'premium'
    status: 'active' | 'suspended' | 'banned'
}

interface AuthContextType {
    user: any | null
    profile: Profile | null
    session: any | null
    loading: boolean
    signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ error: Error | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>
    refreshProfile: () => Promise<void>
}

interface SignUpMetadata {
    username: string
    phone: string
    gender?: string
    city?: string
    state?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const [profile, setProfile] = useState<Profile | null>(null)
    const loading = status === 'loading'

    useEffect(() => {
        if (session?.user) {
            setProfile({
                id: (session.user as any).id,
                username: (session.user as any).username,
                email: session.user.email || '',
                phone: (session.user as any).phone,
                avatar_url: (session.user as any).avatarUrl,
                gender: (session.user as any).gender || null,
                birthdate: (session.user as any).birthdate || null,
                plan: (session.user as any).plan || 'free',
                status: 'active' // Default for now
            })
        } else {
            setProfile(null)
        }
    }, [session])

    // Sign up
    const signUp = async (email: string, password: string, metadata: SignUpMetadata) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, metadata })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao realizar cadastro')
            }

            // After signup, automatically sign in
            return await signIn(email, password)
        } catch (error) {
            logger.error('auth', 'signup', 'Signup failed', error)
            return { error: error as Error }
        }
    }

    // Sign in
    const signIn = async (email: string, password: string) => {
        try {
            // Need to handle the phone-based email generation if necessary, 
            // but the caller (AuthModal) already does that.
            const result = await nextAuthSignIn('credentials', {
                redirect: false,
                phone: email.split('@')[0].replace(/^55/, ''), // Extract phone from synthetic email if needed
                password
            })

            if (result?.error) {
                throw new Error(result.error === 'CredentialsSignin' ? 'Telefone ou senha incorretos' : result.error)
            }

            return { error: null }
        } catch (error) {
            logger.error('auth', 'signIn', 'Login failed', error)
            return { error: error as Error }
        }
    }

    // Sign out
    const signOut = async () => {
        await nextAuthSignOut({ callbackUrl: '/vendas' })
    }

    // Update profile
    const updateProfile = async (data: Partial<Profile>) => {
        // This will need a new API route /api/profile/update
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) throw new Error('Erro ao atualizar perfil')

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Refresh profile
    const refreshProfile = async () => {
        // NextAuth handle this via session polling or manual update
        // For simplicity, we can just reload the page or use session update
    }

    return (
        <AuthContext.Provider
            value={{
                user: session?.user || null,
                profile,
                session,
                loading,
                signUp,
                signIn,
                signOut,
                updateProfile,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Helper hook to check if user can create listing
export function useCanCreateListing() {
    const { profile } = useAuth()
    const [canCreate, setCanCreate] = useState(false)
    const [activeCount, setActiveCount] = useState(0)
    const [limit, setLimit] = useState(3)

    useEffect(() => {
        const checkLimit = async () => {
            if (!profile) {
                setCanCreate(false)
                return
            }

            try {
                const response = await fetch(`/api/user/listings-count?userId=${profile.id}`)
                const { count } = await response.json()

                const planLimits = {
                    free: 3,
                    basic: 5,
                    pro: 10,
                    premium: 999,
                }

                const userLimit = planLimits[profile.plan] || 3
                const currentCount = count || 0

                setActiveCount(currentCount)
                setLimit(userLimit)
                setCanCreate(currentCount < userLimit)
            } catch (error) {
                console.error('Error checking limit:', error)
            }
        }

        checkLimit()
    }, [profile])

    return { canCreate, activeCount, limit }
}
