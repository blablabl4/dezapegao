'use client'

import Link from 'next/link'
import { formatPrice, timeAgo } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { getStoredListings, deleteStoredListing, getCurrentStoredUser, type StoredListing } from '@/lib/local-storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

export default function DashboardPage() {
    const [listings, setListings] = useState<StoredListing[]>([])
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const currentUser = getCurrentStoredUser()
        setUser(currentUser)

        const allListings = getStoredListings()
        const myListings = currentUser
            ? allListings.filter(l => l.user_id === currentUser.id)
            : allListings
        setListings(myListings)
    }, [])

    const handleDelete = (id: string) => {
        if (confirm('Excluir este anúncio?')) {
            deleteStoredListing(id)
            setListings(listings.filter(l => l.id !== id))
        }
    }

    const weeklyLimit = 3
    const weeklyCount = listings.length
    const remaining = weeklyLimit - weeklyCount
    const totalLikes = listings.reduce((sum, l) => sum + l.likes_count, 0)
    const totalClicks = listings.reduce((sum, l) => sum + l.whatsapp_clicks, 0)

    return (
        <div className="min-h-screen relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900" />

            <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="text-white/70 hover:text-white text-sm flex items-center transition">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Feed
                    </Link>
                    <p className="text-xs text-white/50">
                        {user ? `@${user.username}` : 'Visitante'}
                    </p>
                </div>

                <h1 className="text-2xl font-bold text-white mb-6">Meus Anúncios</h1>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-2xl p-4 text-center" style={glassStyle}>
                        <p className="text-2xl font-bold text-white">{listings.length}</p>
                        <p className="text-xs text-white/60">Anúncios</p>
                    </div>
                    <div className="rounded-2xl p-4 text-center" style={glassStyle}>
                        <p className="text-2xl font-bold text-pink-400">{totalLikes}</p>
                        <p className="text-xs text-white/60">Curtidas</p>
                    </div>
                    <div className="rounded-2xl p-4 text-center" style={glassStyle}>
                        <p className="text-2xl font-bold text-green-400">{totalClicks}</p>
                        <p className="text-xs text-white/60">Contatos</p>
                    </div>
                </div>

                <div className="rounded-2xl p-4 mb-6" style={glassStyle}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/80">Esta semana</span>
                        <span className="text-sm font-medium text-purple-300">{remaining} restantes</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min((weeklyCount / weeklyLimit) * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs text-white/50 mt-2">{weeklyCount}/{weeklyLimit} anúncios</p>
                </div>

                <Link href="/dashboard/new" className="block w-full bg-white text-purple-600 text-center py-4 rounded-2xl font-semibold hover:bg-white/90 transition mb-6">
                    + Criar anúncio
                </Link>

                <h3 className="text-lg font-semibold text-white mb-4">Meus anúncios</h3>
                <div className="space-y-3">
                    {listings.length > 0 ? (
                        listings.map((listing) => (
                            <div key={listing.id} className="rounded-2xl p-3" style={glassStyle}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                                        <img src={listing.image_urls[0]} alt={listing.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate text-sm">{listing.title}</h4>
                                        <p className="text-lg font-bold text-green-400">{formatPrice(listing.price)}</p>
                                        <div className="flex items-center space-x-3 text-xs text-white/50 mt-0.5">
                                            <span>❤️ {listing.likes_count}</span>
                                            <span>💬 {listing.whatsapp_clicks}</span>
                                            <span>{timeAgo(listing.created_at)}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${listing.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>
                                        {listing.status === 'active' ? '🟢' : '⏸️'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-white/10">
                                    <button onClick={() => handleDelete(listing.id)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition" style={glassStyle}>
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 rounded-2xl" style={glassStyle}>
                            <p className="text-4xl mb-3">📦</p>
                            <p className="text-white/60 text-sm mb-3">Nenhum anúncio</p>
                            <Link href="/dashboard/new" className="text-purple-300 hover:text-white text-sm font-medium">
                                Criar primeiro →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
