'use client'

import { useAuth } from '@/hooks/useAuth'
import { DEMO_MODE } from '@/lib/mock-data'
import { getCurrentStoredUser } from '@/lib/local-storage'
import { useEffect, useState } from 'react'

interface UserAvatarProps {
    onClick: () => void
}

export function UserAvatar({ onClick }: UserAvatarProps) {
    const { profile, loading } = useAuth()
    const [demoUser, setDemoUser] = useState<any>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (DEMO_MODE) {
            // Poll for demo user changes
            const checkUser = () => {
                setDemoUser(getCurrentStoredUser())
            }
            checkUser()
            const interval = setInterval(checkUser, 1000)
            return () => clearInterval(interval)
        }
    }, [])

    if (!mounted) return null

    // Get user data from Supabase or demo mode
    const user = DEMO_MODE ? demoUser : profile
    const hasAvatar = user?.avatar_url && user.avatar_url.length > 0
    const initial = user?.username?.[0]?.toUpperCase() || '?'

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition shadow-lg overflow-hidden disabled:opacity-50"
        >
            {hasAvatar ? (
                <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{initial}</span>
            )}
        </button>
    )
}
