'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_MODE } from '@/lib/mock-data'
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
    const { signUp, signIn } = useAuth()
    const [mode, setMode] = useState<'login' | 'signup'>('signup')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        phone: '',
        gender: '',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const resetForm = () => {
        setFormData({ email: '', password: '', username: '', phone: '', gender: '' })
        setError('')
        setSuccess('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (DEMO_MODE) {
                // Demo mode - use localStorage
                if (mode === 'signup') {
                    if (!formData.username || !formData.email || !formData.phone) {
                        setError('Preencha todos os campos obrigatórios')
                        setLoading(false)
                        return
                    }
                    setCurrentStoredUser({
                        id: Date.now().toString(),
                        username: formData.username,
                        email: formData.email,
                        phone: formData.phone,
                        gender: formData.gender as any || undefined,
                        plan: 'free',
                    })
                } else {
                    if (!formData.email) {
                        setError('Digite seu email')
                        setLoading(false)
                        return
                    }
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
            } else {
                // Real Supabase Auth
                if (mode === 'signup') {
                    // Validate fields
                    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
                        setError('Preencha todos os campos obrigatórios')
                        setLoading(false)
                        return
                    }

                    if (formData.password.length < 6) {
                        setError('Senha deve ter pelo menos 6 caracteres')
                        setLoading(false)
                        return
                    }

                    const { error: signUpError } = await signUp(formData.email, formData.password, {
                        username: formData.username,
                        phone: formData.phone,
                        gender: formData.gender,
                    })

                    if (signUpError) {
                        if (signUpError.message.includes('already registered')) {
                            setError('Email já cadastrado. Tente fazer login.')
                        } else {
                            setError(signUpError.message)
                        }
                        setLoading(false)
                        return
                    }

                    setSuccess('Conta criada! Verifique seu email para confirmar.')
                    setTimeout(() => {
                        resetForm()
                        setMode('login')
                    }, 2000)
                } else {
                    // Login
                    if (!formData.email || !formData.password) {
                        setError('Digite email e senha')
                        setLoading(false)
                        return
                    }

                    const { error: signInError } = await signIn(formData.email, formData.password)

                    if (signInError) {
                        if (signInError.message.includes('Invalid login')) {
                            setError('Email ou senha incorretos')
                        } else {
                            setError(signInError.message)
                        }
                        setLoading(false)
                        return
                    }

                    onSuccess()
                    onClose()
                    router.refresh()
                }
            }
        } catch (err) {
            setError('Erro inesperado. Tente novamente.')
        } finally {
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
                    className="w-full max-w-sm rounded-3xl p-6 border border-white/10 relative"
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

                        {success && (
                            <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-2 rounded-xl text-sm text-center">
                                {success}
                            </div>
                        )}

                        {mode === 'signup' && (
                            <input
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-base"
                                placeholder="Nome de usuário"
                                autoComplete="username"
                            />
                        )}

                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-base"
                            placeholder="seu@email.com"
                            autoComplete="email"
                        />

                        {mode === 'signup' && (
                            <>
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-base"
                                    placeholder="WhatsApp: 11999999999"
                                    autoComplete="tel"
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
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-base"
                            placeholder={mode === 'signup' ? 'Criar senha (mín. 6 caracteres)' : 'Senha'}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
                                <button onClick={() => { setMode('login'); resetForm(); }} className="text-white font-semibold hover:underline">
                                    Entrar
                                </button>
                            </p>
                        ) : (
                            <p className="text-white/60 text-sm">
                                Não tem conta?{' '}
                                <button onClick={() => { setMode('signup'); resetForm(); }} className="text-white font-semibold hover:underline">
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
