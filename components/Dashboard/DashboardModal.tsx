'use client'

import { formatPrice } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { getStoredListings, deleteStoredListing, updateStoredListing, getCurrentStoredUser, type StoredListing } from '@/lib/local-storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

interface DashboardModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit?: (listingId: string) => void
    onRefresh?: () => void
}

export function DashboardModal({ isOpen, onClose, onEdit, onRefresh }: DashboardModalProps) {
    const [listings, setListings] = useState<StoredListing[]>([])
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        if (isOpen) {
            loadListings()
        }
    }, [isOpen])

    const loadListings = () => {
        const currentUser = getCurrentStoredUser()
        setUser(currentUser)

        const allListings = getStoredListings()
        const myListings = currentUser
            ? allListings.filter(l => l.user_id === currentUser.id)
            : allListings
        setListings(myListings)
    }

    const handleDelete = (id: string) => {
        if (confirm('Excluir este anúncio?')) {
            deleteStoredListing(id)
            loadListings()
        }
    }

    const toggleSold = (id: string) => {
        const listing = listings.find(l => l.id === id)
        if (listing) {
            const newStatus = listing.status === 'active' ? 'expired' : 'active'
            updateStoredListing(id, { status: newStatus })
            loadListings()
        }
    }

    if (!isOpen) return null

    const weeklyLimit = 3
    const weeklyCount = listings.length
    const remaining = weeklyLimit - weeklyCount
    const totalLikes = listings.reduce((sum, l) => sum + l.likes_count, 0)
    const totalClicks = listings.reduce((sum, l) => sum + l.whatsapp_clicks, 0)

    return (
        <>
            <div
                className="fixed top-14 left-0 right-0 bottom-0 bg-black/50 z-40"
                style={{ backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            />

            <div className="fixed top-14 left-0 right-0 bottom-0 z-50 overflow-y-auto">
                <div className="min-h-full max-w-lg mx-auto px-4 py-6" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
                        style={glassStyle}
                    >
                        ✕
                    </button>

                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Meus Anúncios</h1>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={glassStyle}>
                            <p className="text-2xl font-bold text-white">{listings.length}</p>
                            <p className="text-xs text-white/60 text-center">Anúncios</p>
                        </div>
                        <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={glassStyle}>
                            <p className="text-2xl font-bold text-pink-400">{totalLikes}</p>
                            <p className="text-xs text-white/60 text-center">Curtidas</p>
                        </div>
                        <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={glassStyle}>
                            <p className="text-2xl font-bold text-green-400">{totalClicks}</p>
                            <p className="text-xs text-white/60 text-center">Contatos</p>
                        </div>
                    </div>

                    {/* Weekly */}
                    <div className="rounded-2xl p-4 mb-6" style={glassStyle}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/80">Esta semana</span>
                            <span className="text-sm font-medium text-purple-300">{remaining} restantes</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min((weeklyCount / weeklyLimit) * 100, 100)}%` }} />
                        </div>
                        <p className="text-xs text-white/50 mt-2 text-center">{weeklyCount}/{weeklyLimit} anúncios</p>
                    </div>

                    {/* Listings */}
                    <h3 className="text-lg font-semibold text-white mb-4 text-center">Anúncios</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {listings.length > 0 ? (
                            listings.map((listing) => (
                                <div key={listing.id} className="rounded-2xl p-3" style={glassStyle}>
                                    <div className="aspect-square rounded-xl overflow-hidden bg-white/10 mb-3 relative">
                                        <img src={listing.image_urls[0]} alt={listing.title} className="w-full h-full object-cover" />
                                        {listing.status === 'expired' && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-white font-bold text-center">VENDIDO</span>
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="font-medium text-white text-sm truncate mb-1 text-center">{listing.title}</h4>
                                    <p className="text-lg font-bold text-green-400 mb-2 text-center">{formatPrice(listing.price)}</p>

                                    <div className="flex items-center justify-center space-x-2 text-xs text-white/50 mb-3">
                                        <span>❤️ {listing.likes_count}</span>
                                        <span>💬 {listing.whatsapp_clicks}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-1.5">
                                        <button
                                            onClick={() => onEdit?.(listing.id)}
                                            className="w-full text-xs px-3 py-2 rounded-lg transition bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                                        >
                                            ✏️ Editar
                                        </button>

                                        <button
                                            onClick={() => toggleSold(listing.id)}
                                            className={`w-full text-xs px-3 py-2 rounded-lg transition flex items-center justify-center ${listing.status === 'expired'
                                                ? 'bg-gray-500/30 text-gray-300'
                                                : 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/40'
                                                }`}
                                        >
                                            {listing.status === 'expired' ? '✅ Vendido' : '📦 Vendido'}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(listing.id)}
                                            className="w-full text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition hover:bg-red-500/20 flex items-center justify-center"
                                        >
                                            🗑️ Excluir
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-12 rounded-2xl flex flex-col items-center justify-center" style={glassStyle}>
                                <p className="text-4xl mb-3">📦</p>
                                <p className="text-white/60 text-sm">Nenhum anúncio</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
