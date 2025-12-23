'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCurrentStoredUser } from '@/lib/local-storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

const genderOptions = [
    { value: 'male', label: 'M' },
    { value: 'female', label: 'F' },
    { value: 'other', label: 'Outro' },
]

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    message?: string
}

export function AuthModal({ isOpen, onClose, onSuccess, message }: AuthModalProps) {
    const router = useRouter()
    const [mode, setMode] = useState<'login' | 'signup'>('signup')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        phone: '',
        gender: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (mode === 'signup') {
                // Validate required fields
                if (!formData.username || !formData.email || !formData.phone) {
                    setError('Preencha todos os campos obrigatórios')
                    setLoading(false)
                    return
                }

                // Create user in localStorage (demo mode)
                setCurrentStoredUser({
                    id: Date.now().toString(),
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    gender: formData.gender as any || undefined,
                    plan: 'free',
                })
            } else {
                // Login - just check if email exists (demo)
                if (!formData.email) {
                    setError('Digite seu email')
                    setLoading(false)
                    return
                }

                // Demo login - create user with email
                setCurrentStoredUser({
                    id: Date.now().toString(),
                    username: formData.email.split('@')[0],
                    email: formData.email,
                    phone: '',
                    plan: 'free',
                })
            }

            setTimeout(() => {
                onSuccess()
                onClose()
                router.refresh()
            }, 300)
        } catch (err) {
            setError('Erro. Tente novamente.')
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-[200]"
                style={{ backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            />

            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-sm rounded-3xl p-6 border border-white/10"
                    style={glassStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/10 transition flex items-center justify-center text-white/60 hover:text-white"
                    >
                        ✕
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {mode === 'signup' ? 'Criar Conta' : 'Entrar'}
                        </h2>
                        {message && (
                            <p className="text-yellow-300 text-sm">{message}</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-2 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        {mode === 'signup' && (
                            <input
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                                placeholder="Nome de usuário"
                            />
                        )}

                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                            placeholder="seu@email.com"
                        />

                        {mode === 'signup' && (
                            <>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                                    placeholder="WhatsApp: +5511999999999"
                                />

                                <div className="flex gap-2">
                                    {genderOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: opt.value })}
                                            className={`flex-1 py-2 rounded-xl text-sm transition ${formData.gender === opt.value
                                                    ? 'bg-purple-500/50 border-purple-400 text-white'
                                                    : 'bg-white/10 border-white/20 text-white/70'
                                                } border`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm"
                            placeholder="Senha"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-white/90 transition disabled:opacity-50"
                        >
                            {loading ? 'Aguarde...' : mode === 'signup' ? 'Criar conta grátis' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        {mode === 'signup' ? (
                            <p className="text-white/60 text-sm">
                                Já tem conta?{' '}
                                <button onClick={() => setMode('login')} className="text-white font-semibold hover:underline">
                                    Entrar
                                </button>
                            </p>
                        ) : (
                            <p className="text-white/60 text-sm">
                                Não tem conta?{' '}
                                <button onClick={() => setMode('signup')} className="text-white font-semibold hover:underline">
                                    Criar grátis
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
