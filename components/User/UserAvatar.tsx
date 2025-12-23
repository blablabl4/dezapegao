'use client'

import { getCurrentStoredUser } from '@/lib/local-storage'
import { useEffect, useState } from 'react'

interface UserAvatarProps {
    onClick: () => void
}

export function UserAvatar({ onClick }: UserAvatarProps) {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        setUser(getCurrentStoredUser())
    }, [])

    const avatarElement = user?.avatar_url ? (
        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
    ) : (
        <span>{user?.username?.[0]?.toUpperCase() || '?'}</span>
    )

    return (
        <button
            onClick={onClick}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition shadow-lg overflow-hidden"
        >
            {avatarElement}
        </button>
    )
}
