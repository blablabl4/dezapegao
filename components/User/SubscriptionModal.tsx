'use client'

import { useState, useEffect } from 'react'
import { getCurrentStoredUser, updateCurrentStoredUser } from '@/lib/local-storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

interface SubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
}

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['3 anúncios ativos', 'Duração 24h', 'Suporte básico'],
        color: 'from-gray-600 to-gray-700',
        current: true,
    },
    {
        id: 'basic',
        name: 'Basic',
        price: 9.90,
        features: ['10 anúncios ativos', 'Duração 48h', 'Destaque no feed', 'Suporte prioritário'],
        color: 'from-blue-600 to-blue-700',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 19.90,
        features: ['Anúncios ilimitados', 'Duração 7 dias', 'Destaque premium', 'Analytics', 'Suporte VIP'],
        color: 'from-purple-600 to-purple-700',
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 39.90,
        features: ['Tudo do Pro', 'Anúncios patrocinados', 'Sem ads', 'Suporte 24/7', 'Badge exclusivo'],
        color: 'from-yellow-600 to-orange-600',
        popular: false,
    },
]

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const [currentPlan, setCurrentPlan] = useState('free')
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            const user = getCurrentStoredUser()
            if (user?.plan) {
                setCurrentPlan(user.plan)
            }
        }
    }, [isOpen])

    const handleUpgrade = (planId: string) => {
        setSelectedPlan(planId)
        // TODO: Integrate with payment gateway
        alert(`Upgrade para ${planId} - Em breve!`)
    }

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed top-14 left-0 right-0 bottom-0 bg-black/50 z-40"
                style={{ backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            />

            <div className="fixed top-14 left-0 right-0 bottom-0 z-50 overflow-y-auto">
                <div className="min-h-full max-w-2xl mx-auto px-4 py-6" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-white/10 transition"
                        style={glassStyle}
                    >
                        <div className="w-full h-full flex items-center justify-center text-white/80 hover:text-white text-xl">
                            ✕
                        </div>
                    </button>

                    <h1 className="text-2xl font-bold text-white mb-2 text-center">Assinatura</h1>
                    <p className="text-white/60 text-sm mb-6 text-center">
                        Escolha o plano ideal para você
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-5 border transition ${currentPlan === plan.id
                                        ? 'border-green-400 shadow-lg shadow-green-500/20'
                                        : 'border-white/20 hover:border-white/40'
                                    }`}
                                style={glassStyle}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                                        POPULAR
                                    </div>
                                )}

                                {currentPlan === plan.id && (
                                    <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                        ATUAL
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white font-bold text-xl mb-4`}>
                                    {plan.name[0]}
                                </div>

                                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>

                                <div className="mb-4">
                                    {plan.price === 0 ? (
                                        <span className="text-2xl font-bold text-green-400">Grátis</span>
                                    ) : (
                                        <>
                                            <span className="text-2xl font-bold text-white">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                                            <span className="text-white/50 text-sm">/mês</span>
                                        </>
                                    )}
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-white/80 text-sm">
                                            <span className="text-green-400 mr-2">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {currentPlan === plan.id ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-white/10 text-white/50 font-semibold cursor-not-allowed"
                                    >
                                        Plano Atual
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        className={`w-full py-3 rounded-xl font-semibold transition ${plan.popular
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                : 'bg-white/20 hover:bg-white/30 text-white'
                                            }`}
                                    >
                                        Assinar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
