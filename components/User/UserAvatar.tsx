'use client'

import { getCurrentStoredUser } from '@/lib/local-storage'
import { useEffect, useState } from 'react'

interface UserAvatarProps {
    onClick: () => void
}

export function UserAvatar({ onClick }: UserAvatarProps) {
    const [user, setUser] = useState<any>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check for user on mount and on storage changes
        const checkUser = () => {
            setUser(getCurrentStoredUser())
        }

        checkUser()

        // Listen for storage changes (when user logs in)
        window.addEventListener('storage', checkUser)

        // Also check periodically for changes in same tab
        const interval = setInterval(checkUser, 1000)

        return () => {
            window.removeEventListener('storage', checkUser)
            clearInterval(interval)
        }
    }, [])

    if (!mounted) return null

    const hasAvatar = user?.avatar_url && user.avatar_url.length > 0

    return (
        <button
            onClick={onClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition shadow-lg overflow-hidden"
        >
            {hasAvatar ? (
                <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{user?.username?.[0]?.toUpperCase() || '?'}</span>
            )}
        </button>
    )
}
