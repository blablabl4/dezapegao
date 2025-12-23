'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE } from '@/lib/mock-data'

interface LikeButtonProps {
    listingId: string
    initialLikes: number
    userId?: string
    variant?: 'default' | 'reels'
}

// Glass style for consistency
const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

export function LikeButton({ listingId, initialLikes, userId, variant = 'default' }: LikeButtonProps) {
    const router = useRouter()
    const [likes, setLikes] = useState(initialLikes)
    const [isLiked, setIsLiked] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!userId || DEMO_MODE) return

        const checkIfLiked = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('listing_id', listingId)
                .eq('user_id', userId)
                .single()

            setIsLiked(!!data)
        }

        checkIfLiked()
    }, [listingId, userId])

    const handleLike = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading) return

        if (!userId) {
            if (DEMO_MODE) {
                setIsLiked(prev => !prev)
                setLikes(prev => isLiked ? prev - 1 : prev + 1)
                return
            }
            router.push('/signup')
            return
        }

        if (DEMO_MODE) {
            setIsLiked(prev => !prev)
            setLikes(prev => isLiked ? prev - 1 : prev + 1)
            return
        }

        setLoading(true)
        const supabase = createClient()

        const doLike = async () => {
            try {
                if (isLiked) {
                    const { error } = await supabase.from('likes').delete().eq('listing_id', listingId).eq('user_id', userId)
                    if (!error) {
                        setLikes((prev) => prev - 1)
                        setIsLiked(false)
                    }
                } else {
                    const { error } = await supabase.from('likes').insert({ listing_id: listingId, user_id: userId })
                    if (!error) {
                        setLikes((prev) => prev + 1)
                        setIsLiked(true)
                    }
                }
            } catch (error) {
                console.error('Like error:', error)
            } finally {
                setLoading(false)
            }
        }

        doLike()
    }, [isLiked, likes, listingId, loading, router, userId])

    // Reels variant - Glass style
    if (variant === 'reels') {
        return (
            <button
                onClick={handleLike}
                onTouchEnd={handleLike}
                disabled={loading && !DEMO_MODE}
                className="flex flex-col items-center touch-manipulation"
                type="button"
            >
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${isLiked ? 'bg-pink-500/80' : 'hover:bg-white/20'
                        }`}
                    style={isLiked ? {
                        background: 'rgba(236, 72, 153, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    } : glassStyle}
                >
                    <svg
                        className={`w-7 h-7 ${isLiked ? 'text-white fill-white' : 'text-white'}`}
                        fill={isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </div>
                <span className="text-white/80 text-xs mt-1 font-medium">{likes}</span>
            </button>
        )
    }

    // Default variant
    return (
        <button
            onClick={handleLike}
            onTouchEnd={handleLike}
            disabled={loading && !DEMO_MODE}
            type="button"
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition touch-manipulation ${isLiked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            <svg className={`w-6 h-6 ${isLiked ? 'fill-pink-600' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likes}</span>
        </button>
    )
}
