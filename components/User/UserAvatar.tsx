'use client'

import { useAuth } from '@/hooks/useAuth'

interface UserAvatarProps {
    onClick: () => void
}

export function UserAvatar({ onClick }: UserAvatarProps) {
    const { profile, user, loading } = useAuth()

    // Get user data from profile or user metadata
    const hasAvatar = profile?.avatar_url && profile.avatar_url.length > 0
    const username = profile?.username || user?.user_metadata?.username || ''
    const initial = username?.[0]?.toUpperCase() || '?'

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition shadow-lg overflow-hidden disabled:opacity-50"
        >
            {hasAvatar ? (
                <img
                    src={profile.avatar_url!}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{initial}</span>
            )}
        </button>
    )
}
