'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { formatPrice, timeAgo } from '@/lib/utils'
import { LikeButton } from './LikeButton'
import type { ListingWithProfile } from '@/types/database'

interface ReelsFeedProps {
    listings: ListingWithProfile[]
    userId?: string
}

const categoryIcons: Record<string, string> = {
    roupas: '👕',
    eletronicos: '📱',
    moveis: '🛋️',
    eletrodomesticos: '🔌',
    brinquedos: '🧸',
    esportes: '⚽',
    veiculos: '🚗',
    outros: '📦',
}

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
}

export function ReelsFeed({ listings, userId }: ReelsFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showInfoPanel, setShowInfoPanel] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const currentListing = listings[currentIndex]

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget
        const scrollPosition = container.scrollTop
        const itemHeight = container.clientHeight
        const newIndex = Math.round(scrollPosition / itemHeight)
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < listings.length) {
            setCurrentIndex(newIndex)
            trackCategoryView(listings[newIndex].category)
        }
    }

    const trackCategoryView = async (category: string) => {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'category_view', category }),
            })
        } catch (error) { }
    }

    const handleWhatsAppClick = async (listing: ListingWithProfile) => {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: listing.id, action: 'whatsapp_click' }),
            })
        } catch (error) { }

        if (listing.profiles.phone) {
            const message = `Olá! Vi seu anúncio "${listing.title}" por ${formatPrice(listing.price)} no Dezapegão!`
            window.open(`https://wa.me/${listing.profiles.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
        } else {
            alert('Vendedor não cadastrou WhatsApp')
        }
    }

    const handleShare = async (listing: ListingWithProfile) => {
        const shareData = {
            title: listing.title,
            text: `${listing.title} - ${formatPrice(listing.price)} no Dezapegão`,
            url: `${window.location.origin}/anuncio/${listing.id}`,
        }

        if (navigator.share) {
            try { await navigator.share(shareData) } catch { }
        } else {
            await navigator.clipboard.writeText(shareData.url)
            alert('Link copiado!')
        }
    }

    const handleReport = () => {
        const reason = prompt('Por que você está denunciando?')
        if (reason) alert('Denúncia enviada!')
    }

    return (
        <>
            {/* Handle - Always visible, moves with panel */}
            <button
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                className="fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out"
                style={{ left: showInfoPanel ? 'min(50vw, 28rem)' : '0' }}
            >
                <div
                    className="flex items-center py-3 px-2 rounded-r-full hover:bg-black/50 transition-colors"
                    style={glassStyle}
                >
                    {!showInfoPanel && (
                        <span className="text-white/90 text-xs font-medium whitespace-nowrap mr-1">
                            ver preço
                        </span>
                    )}
                    <svg
                        className={`w-4 h-4 text-white/80 transition-transform duration-300 ${showInfoPanel ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </button>

            {/* Panel */}
            <div
                className="fixed top-0 bottom-0 left-0 z-40 w-1/2 max-w-md transition-transform duration-300 ease-out"
                style={{
                    ...glassStyle,
                    borderRight: '1px solid rgba(255,255,255,0.1)',
                    transform: showInfoPanel ? 'translateX(0)' : 'translateX(-100%)',
                }}
            >
                {currentListing && (
                    <div className="h-full overflow-y-auto scrollbar-hide p-6 pt-8">
                        {/* Seller */}
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {currentListing.profiles.username[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">{currentListing.profiles.username}</p>
                                <p className="text-white/50 text-sm">Vendedor</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 my-4" />

                        <h2 className="text-white text-2xl font-bold mb-4">{currentListing.title}</h2>
                        <p className="text-green-400 text-3xl font-bold mb-6">{formatPrice(currentListing.price)}</p>

                        <div className="mb-6">
                            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Localização</p>
                            <p className="text-white font-medium text-lg">
                                📍 {currentListing.location?.bairro || 'Não informado'}, {currentListing.location?.cidade || 'SP'}/{currentListing.location?.estado || 'SP'}
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Descrição</p>
                            <p className="text-white/90 leading-relaxed">{currentListing.description || 'Sem descrição.'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop */}
            {showInfoPanel && (
                <div
                    className="fixed inset-0 z-30 bg-black/20"
                    onClick={() => setShowInfoPanel(false)}
                />
            )}

            {/* Reels Container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            >
                {listings.map((listing, index) => (
                    <div key={listing.id} className="h-full w-full snap-start relative bg-black">
                        <div className="absolute inset-0">
                            <Image src={listing.image_url} alt={listing.title} fill className="object-cover" priority={index < 2} sizes="100vw" />
                        </div>

                        <div className="absolute inset-0 z-10 pointer-events-none">
                            <div className="absolute top-4 left-4 pointer-events-auto">
                                <div className="flex items-center space-x-2 text-white drop-shadow-lg">
                                    <span className="text-sm">{categoryIcons[listing.category]}</span>
                                    <span className="text-sm capitalize font-medium">{listing.category}</span>
                                    <span className="text-white/60">•</span>
                                    <span className="text-white/80 text-sm">{timeAgo(listing.created_at)}</span>
                                </div>
                            </div>

                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                                <div className="flex items-center px-3 py-2 rounded-full" style={{ ...glassStyle, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="w-6 h-2 bg-white rounded-full" />
                                </div>
                            </div>

                            <div className="absolute right-4 bottom-8 flex flex-col items-center space-y-3 pointer-events-auto">
                                <LikeButton listingId={listing.id} initialLikes={listing.likes_count} userId={userId} variant="reels" />

                                <button onClick={() => handleShare(listing)} className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 transition" style={{ ...glassStyle, border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 text-xs mt-1">Enviar</span>
                                </button>

                                <button onClick={() => handleWhatsAppClick(listing)} className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-green-600 transition" style={{ background: 'rgba(34, 197, 94, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 text-xs mt-1">WhatsApp</span>
                                </button>

                                <button onClick={handleReport} className="flex flex-col items-center opacity-50 hover:opacity-100 transition">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/40 transition" style={{ ...glassStyle, border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {index < listings.length - 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-20">
                                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}
