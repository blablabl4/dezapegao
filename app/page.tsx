'use client'

import { ReelsFeed } from '@/components/Feed/ReelsFeed'
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
import { useEffect, useState } from 'react'
import { getStoredListings, getCurrentStoredUser, type StoredListing } from '@/lib/local-storage'

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

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [listings, setListings] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    setMounted(true)
    try {
      loadData()
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [])

  const loadData = () => {
    const storedListings = getStoredListings()
    const currentUser = getCurrentStoredUser()

    const feedListings = storedListings
      .filter(l => l.status === 'active')
      .map((listing: StoredListing) => ({
        ...listing,
        image_url: listing.image_urls[0],
        profiles: currentUser || {
          id: listing.user_id,
          username: 'Usuário',
          phone: '+5511999999999',
        }
      }))

    setListings(feedListings)
    setUser(currentUser)
  }

  // Check if user is logged in, show auth modal if not
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

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 h-14 relative z-30">
        <div className="absolute inset-0" style={yellowGlassStyle} />
        <div className="relative h-full flex items-center justify-between px-4">
          <UserAvatar onClick={openUserMenu} />

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-xl font-bold text-white drop-shadow-lg">
              Dezapegão
            </span>
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
      </header>

      {/* Feed */}
      <main className="flex-1 overflow-hidden">
        {listings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 px-4">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              Nenhum anúncio 📦
            </h2>
            <p className="text-white/80 mb-8 text-center">
              Seja o primeiro!
            </p>
            <button
              onClick={openNewListing}
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition shadow-lg text-center"
            >
              Criar anúncio
            </button>
          </div>
        ) : (
          <ReelsFeed
            listings={listings}
            userId={user?.id}
            onRequireAuth={(action) => {
              setAuthMessage(`Para ${action}, crie uma conta grátis!`)
              setAuthOpen(true)
            }}
          />
        )}
      </main>

      {/* Auth Modal - Always available */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          loadData()
          setAuthOpen(false)
        }}
        message={authMessage}
      />

      {/* Other Modals - Only for authenticated users */}
      {mounted && user && (
        <>
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
            onClose={() => {
              setDashboardOpen(false)
              loadData()
            }}
            onEdit={handleEdit}
          />

          <NewListingModal
            isOpen={newListingOpen}
            onClose={() => {
              setNewListingOpen(false)
              loadData()
            }}
          />

          <EditListingModal
            isOpen={editListingOpen}
            onClose={() => {
              setEditListingOpen(false)
              setEditListingId(null)
              loadData()
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
        </>
      )}
    </div>
  )
}
