'use client'

import { useState, useEffect } from 'react'
import { getCurrentStoredUser } from '@/lib/local-storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

interface PaymentsModalProps {
    isOpen: boolean
    onClose: () => void
}

// Mock payment history
const mockPayments = [
    { id: '1', date: '2024-01-15', amount: 19.90, plan: 'Pro', status: 'paid' },
    { id: '2', date: '2023-12-15', amount: 19.90, plan: 'Pro', status: 'paid' },
    { id: '3', date: '2023-11-15', amount: 19.90, plan: 'Pro', status: 'paid' },
]

export function PaymentsModal({ isOpen, onClose }: PaymentsModalProps) {
    const [user, setUser] = useState<any>(null)
    const [payments] = useState(mockPayments)
    const [addingCard, setAddingCard] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setUser(getCurrentStoredUser())
        }
    }, [isOpen])

    if (!isOpen) return null

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
                        className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-white/10 transition"
                        style={glassStyle}
                    >
                        <div className="w-full h-full flex items-center justify-center text-white/80 hover:text-white text-xl">
                            ✕
                        </div>
                    </button>

                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Pagamentos</h1>

                    {/* Payment Method */}
                    <div className="mb-8">
                        <h2 className="text-white font-semibold mb-4 flex items-center">
                            <span className="mr-2">💳</span> Método de Pagamento
                        </h2>

                        {user?.plan === 'free' ? (
                            <div className="rounded-xl p-5 text-center" style={glassStyle}>
                                <p className="text-white/70 mb-4">Você está no plano Free</p>
                                <p className="text-white/50 text-sm">Adicione um cartão para fazer upgrade</p>
                            </div>
                        ) : (
                            <div className="rounded-xl p-5" style={glassStyle}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center mr-4">
                                            <span className="text-white text-xs font-bold">VISA</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">•••• •••• •••• 4242</p>
                                            <p className="text-white/50 text-xs">Expira 12/25</p>
                                        </div>
                                    </div>
                                    <button className="text-red-400 hover:text-red-300 text-sm">Remover</button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setAddingCard(!addingCard)}
                            className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
                        >
                            Adicionar cartão
                        </button>

                        {addingCard && (
                            <div className="mt-4 p-5 rounded-xl space-y-4" style={glassStyle}>
                                <input
                                    type="text"
                                    placeholder="Número do cartão"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="MM/AA"
                                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVV"
                                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nome no cartão"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                                />
                                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition">
                                    Salvar Cartão
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment History */}
                    <div>
                        <h2 className="text-white font-semibold mb-4 flex items-center">
                            <span className="mr-2">📋</span> Histórico
                        </h2>

                        {payments.length === 0 ? (
                            <div className="rounded-xl p-5 text-center" style={glassStyle}>
                                <p className="text-white/50">Nenhum pagamento registrado</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="rounded-xl p-4 flex items-center justify-between" style={glassStyle}>
                                        <div>
                                            <p className="text-white font-medium">Plano {payment.plan}</p>
                                            <p className="text-white/50 text-xs">
                                                {new Date(payment.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400 font-bold">
                                                R$ {payment.amount.toFixed(2).replace('.', ',')}
                                            </p>
                                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                                                Pago
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
