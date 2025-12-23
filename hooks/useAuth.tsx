'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
    id: string
    username: string
    email: string
    phone: string
    avatar_url: string | null
    gender: 'male' | 'female' | 'other' | 'prefer_not_say' | null
    birthdate: string | null
    city: string | null
    state: string | null
    plan: 'free' | 'basic' | 'pro' | 'premium'
    status: 'active' | 'suspended' | 'banned'
    created_at: string
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    session: Session | null
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
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    // Fetch profile data
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data as Profile
    }

    // Initialize auth state
    useEffect(() => {
        let mounted = true

        const initAuth = async () => {
            try {
                // Safety timeout - don't hang forever
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth timeout')), 5000)
                )

                const sessionPromise = supabase.auth.getSession()

                const { data: { session: currentSession } } = await Promise.race([
                    sessionPromise,
                    timeout
                ]) as { data: { session: any } }

                if (mounted && currentSession?.user) {
                    setSession(currentSession)
                    setUser(currentSession.user)
                    // Don't wait for profile - load in background
                    fetchProfile(currentSession.user.id).then(profileData => {
                        if (mounted) setProfile(profileData)
                    })
                }
            } catch (error) {
                console.error('Auth init error:', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession)
                setUser(newSession?.user ?? null)

                if (newSession?.user) {
                    const profileData = await fetchProfile(newSession.user.id)
                    setProfile(profileData)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // Sign up
    const signUp = async (email: string, password: string, metadata: SignUpMetadata) => {
        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (signUpError) throw signUpError

            // Create profile after signup
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        username: metadata.username,
                        email: email,
                        phone: metadata.phone,
                        gender: metadata.gender || null,
                        city: metadata.city || null,
                        state: metadata.state || null,
                        plan: 'free',
                        status: 'active',
                    })

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                    // Don't throw - user is created, profile can be fixed later
                }
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Sign in
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setSession(null)
    }

    // Update profile
    const updateProfile = async (data: Partial<Profile>) => {
        if (!user) return { error: new Error('Not authenticated') }

        try {
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id)

            if (error) throw error

            // Refresh profile data
            const updatedProfile = await fetchProfile(user.id)
            setProfile(updatedProfile)

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Refresh profile
    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
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

            const supabase = createClient()
            const { count } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('status', 'active')

            const planLimits = {
                free: 3,
                basic: 5,
                pro: 10,
                premium: 999,
            }

            const userLimit = planLimits[profile.plan] || 3
            const activeCount = count || 0

            setActiveCount(activeCount)
            setLimit(userLimit)
            setCanCreate(activeCount < userLimit)
        }

        checkLimit()
    }, [profile])

    return { canCreate, activeCount, limit }
}
