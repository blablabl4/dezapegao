'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

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
            // Clean phone number (keep only digits)
            const cleanPhone = formData.phone.replace(/\D/g, '')

            // Validation
            if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                setError('Telefone inválido. Use DDD + Número (ex: 11999999999)')
                setLoading(false)
                return
            }

            if (!formData.password || formData.password.length < 6) {
                setError('Senha deve ter pelo menos 6 caracteres')
                setLoading(false)
                return
            }

            // Generate synthetic email for Supabase Auth
            // Format: 55 + DDD + Number @dezapegao.com
            // If user typed 55 prefix locally, handle it, but usually Brazilians type 11...
            // Let's assume input is DDD + Number (10 or 11 digits)
            const emailAuth = `55${cleanPhone}@dezapegao.com`

            if (mode === 'signup') {
                if (!formData.username) {
                    setError('Digite seu nome de usuário')
                    setLoading(false)
                    return
                }

                const { error: signUpError } = await signUp(emailAuth, formData.password, {
                    username: formData.username,
                    phone: cleanPhone, // Save pure number
                    gender: formData.gender || 'other',
                })

                if (signUpError) {
                    if (signUpError.message.includes('already registered')) {
                        setError('Telefone já cadastrado. Tente entrar.')
                    } else {
                        setError(signUpError.message)
                    }
                    setLoading(false)
                    return
                }

                onSuccess()
                onClose()
                router.refresh()
            } else {
                // Login
                const { error: signInError } = await signIn(emailAuth, formData.password)

                if (signInError) {
                    if (signInError.message.includes('Invalid login')) {
                        setError('Telefone ou senha incorretos')
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

                        {/* Username only for Signup */}
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

                        {/* Phone Number - ALWAYS VISIBLE */}
                        <div className="space-y-1">
                            <label className="text-xs text-white/60 ml-2">WhatsApp / Telefone</label>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-base"
                                placeholder="DDD + Número (ex: 11999999999)"
                                autoComplete="tel"
                            />
                        </div>

                        {/* Gender only for Signup */}
                        {mode === 'signup' && (
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
                        )}

                        <div className="space-y-1">
                            <label className="text-xs text-white/60 ml-2">Senha</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-base"
                                placeholder={mode === 'signup' ? 'Criar senha (mín. 6 caracteres)' : 'Sua senha'}
                                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            />
                        </div>

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
