'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

interface UserMenuProps {
    isOpen: boolean
    onClose: () => void
    onOpenDashboard: () => void
    onOpenSettings: () => void
    onOpenSubscription: () => void
    onOpenPayments: () => void
}

export function UserMenu({ isOpen, onClose, onOpenDashboard, onOpenSettings, onOpenSubscription, onOpenPayments }: UserMenuProps) {
    const { profile, signOut } = useAuth()
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await signOut()
            onClose()
            // Full page reload to clear all cached state
            window.location.href = '/'
        } catch (error) {
            console.error('Logout error:', error)
            setLoggingOut(false)
        }
    }

    const avatarElement = profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
    ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
            {profile?.username?.[0]?.toUpperCase() || '?'}
        </div>
    )

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 z-[100]"
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }}
            />

            <div
                className="fixed top-0 bottom-0 left-0 w-72 z-[110] transition-transform duration-300 ease-out"
                style={glassStyle}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-full flex flex-col p-6">
                    {/* User info */}
                    <div className="mb-8">
                        {avatarElement}
                        <h2 className="text-white font-bold text-lg mt-3">{profile?.username || 'Usuário'}</h2>
                        <p className="text-white/60 text-sm">{profile?.email || ''}</p>
                        <div className="mt-2 px-2 py-1 bg-purple-500/30 rounded-lg inline-flex items-center justify-center gap-1">
                            <span className="text-xs flex items-center justify-center">👑</span>
                            <span className="text-xs text-purple-200 font-medium flex items-center justify-center capitalize">{profile?.plan || 'Free'}</span>
                        </div>
                    </div>

                    {/* Menu items */}
                    <nav className="flex-1 space-y-2">
                        <button
                            onClick={() => {
                                onOpenDashboard()
                                onClose()
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition flex items-center space-x-3"
                        >
                            <span className="text-xl flex items-center justify-center">📦</span>
                            <span className="font-medium flex items-center">Meus Anúncios</span>
                        </button>

                        <button
                            onClick={() => {
                                onOpenSubscription()
                                onClose()
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition flex items-center space-x-3"
                        >
                            <span className="text-xl flex items-center justify-center">👑</span>
                            <span className="font-medium flex items-center">Assinatura</span>
                        </button>

                        <button
                            onClick={() => {
                                onOpenPayments()
                                onClose()
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition flex items-center space-x-3"
                        >
                            <span className="text-xl flex items-center justify-center">💳</span>
                            <span className="font-medium flex items-center">Pagamentos</span>
                        </button>

                        <button
                            onClick={() => {
                                onOpenSettings()
                                onClose()
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl text-white/90 hover:bg-white/10 transition flex items-center space-x-3"
                        >
                            <span className="text-xl flex items-center justify-center">⚙️</span>
                            <span className="font-medium flex items-center">Configurações</span>
                        </button>
                    </nav>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className={`w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition flex items-center space-x-3 ${loggingOut ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        <span className="text-xl flex items-center justify-center">{loggingOut ? '⏳' : '🚪'}</span>
                        <span className="font-medium flex items-center">{loggingOut ? 'Saindo...' : 'Sair'}</span>
                    </button>
                </div>
            </div>
        </>
    )
}
