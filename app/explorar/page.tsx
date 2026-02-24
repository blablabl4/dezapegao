'use client'

import { StoryCard } from '@/components/Feed/StoryCard'
import { UserAvatar } from '@/components/User/UserAvatar'
import { UserMenu } from '@/components/User/UserMenu'
import { DashboardModal } from '@/components/Dashboard/DashboardModal'
import { NewListingModal } from '@/components/Dashboard/NewListingModal'
import { EditListingModal } from '@/components/Dashboard/EditListingModal'
import { SettingsModal } from '@/components/User/SettingsModal'
import { SubscriptionModal } from '@/components/User/SubscriptionModal'
import { PaymentsModal } from '@/components/User/PaymentsModal'
import { AuthModal } from '@/components/User/AuthModal'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getActiveListings, type Listing } from '@/lib/listings-client'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
}

const yellowGlassStyle = {
    background: 'rgba(250, 204, 21, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
}

export default function ExplorarPage() {
    const { user, loading } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [listings, setListings] = useState<any[]>([])
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [dashboardOpen, setDashboardOpen] = useState(false)
    const [newListingOpen, setNewListingOpen] = useState(false)
    const [editListingOpen, setEditListingOpen] = useState(false)
    const [editListingId, setEditListingId] = useState<string | null>(null)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [subscriptionOpen, setSubscriptionOpen] = useState(false)
    const [paymentsOpen, setPaymentsOpen] = useState(false)
    const [authOpen, setAuthOpen] = useState(false)
    const [authMessage, setAuthMessage] = useState('')

    const loadListings = useCallback(async () => {
        try {
            const allListings = await getActiveListings()
            const feedListings = allListings.map((listing: Listing) => ({
                ...listing,
                image_url: listing.images?.[0]?.image_url || '',
                profiles: listing.profile || {
                    id: listing.user_id,
                    username: 'Usuário',
                    phone: '',
                }
            }))
            setListings(feedListings)
        } catch (error) {
            console.error('Error loading listings:', error)
        }
    }, [])

    useEffect(() => {
        setMounted(true)
        loadListings()
    }, [loadListings])

    const refreshListings = () => {
        loadListings()
    }

    const requireAuth = (action: string, callback: () => void) => {
        if (!user) {
            setAuthMessage(`Para ${action}, crie uma conta grátis!`)
            setAuthOpen(true)
            return
        }
        callback()
    }

    const handleEdit = (id: string) => {
        setEditListingId(id)
        setEditListingOpen(true)
        setDashboardOpen(false)
    }

    const closeAllModals = () => {
        setDashboardOpen(false)
        setNewListingOpen(false)
        setEditListingOpen(false)
        setSettingsOpen(false)
        setSubscriptionOpen(false)
        setPaymentsOpen(false)
    }

    const openDashboard = () => {
        closeAllModals()
        setDashboardOpen(true)
    }

    const openNewListing = () => {
        requireAuth('criar anúncio', () => {
            closeAllModals()
            setNewListingOpen(true)
        })
    }

    const openSettings = () => {
        closeAllModals()
        setSettingsOpen(true)
    }

    const openSubscription = () => {
        closeAllModals()
        setSubscriptionOpen(true)
    }

    const openPayments = () => {
        closeAllModals()
        setPaymentsOpen(true)
    }

    const openUserMenu = () => {
        requireAuth('acessar o menu', () => {
            setUserMenuOpen(true)
        })
    }

    const handleAuthSuccess = () => {
        refreshListings()
    }

    if (!mounted || loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
                <div className="text-white text-xl font-semibold animate-pulse">
                    Carregando...
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header - Fixed at top */}
            <header className="fixed top-0 left-0 right-0 h-14 z-50">
                <div className="absolute inset-0" style={yellowGlassStyle} />
                <div className="relative h-full flex items-center justify-between px-4">
                    <UserAvatar onClick={openUserMenu} />

                    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                        <span className="text-xl font-bold text-white drop-shadow-lg">
                            Dezapegão
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-medium transition"
                        >
                            Reels
                        </Link>
                        <button
                            onClick={openNewListing}
                            className="w-10 h-10 rounded-full hover:bg-white/10 transition"
                            style={glassStyle}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-14" />

            {/* Main Content */}
            <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Explorar</h1>
                    <div className="flex gap-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Grid View
                        </span>
                    </div>
                </div>

                {listings.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 px-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            Nenhum anúncio 📦
                        </h2>
                        <p className="text-gray-500 mb-8 text-center">
                            Seja o primeiro a desapegar!
                        </p>
                        <button
                            onClick={openNewListing}
                            className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition shadow-lg text-center"
                        >
                            Criar primeiro anúncio
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <StoryCard
                                key={listing.id}
                                listing={listing}
                                userId={user?.id}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer padding for mobile nav if any */}
            <div className="h-20 md:hidden" />

            {/* Modals */}
            <UserMenu
                isOpen={userMenuOpen}
                onClose={() => setUserMenuOpen(false)}
                onOpenDashboard={openDashboard}
                onOpenSettings={openSettings}
                onOpenSubscription={openSubscription}
                onOpenPayments={openPayments}
            />

            <DashboardModal
                isOpen={dashboardOpen}
                onClose={() => setDashboardOpen(false)}
                onEdit={handleEdit}
                onRefresh={refreshListings}
            />

            <NewListingModal
                isOpen={newListingOpen}
                onClose={() => {
                    setNewListingOpen(false)
                    refreshListings()
                }}
            />

            <EditListingModal
                isOpen={editListingOpen}
                onClose={() => {
                    setEditListingOpen(false)
                    refreshListings()
                }}
                listingId={editListingId}
            />

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />

            <SubscriptionModal
                isOpen={subscriptionOpen}
                onClose={() => setSubscriptionOpen(false)}
            />

            <PaymentsModal
                isOpen={paymentsOpen}
                onClose={() => setPaymentsOpen(false)}
            />

            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={handleAuthSuccess}
                message={authMessage}
            />
        </div>
    )
}
