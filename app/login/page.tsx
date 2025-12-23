'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { signInSchema, type SignInInput } from '@/lib/validation'
import { DEMO_MODE } from '@/lib/mock-data'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
}

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (DEMO_MODE) {
                router.push('/')
                router.refresh()
                return
            }

            const data: SignInInput = { email, password }
            signInSchema.parse(data)

            const supabase = createClient()
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

            if (signInError) {
                setError(signInError.message)
                return
            }

            router.push('/')
            router.refresh()
        } catch (err: any) {
            if (err.errors) {
                setError(err.errors[0].message)
            } else {
                setError('Erro ao fazer login. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />

            <div className="w-full max-w-sm relative z-10">
                {/* Glass Card */}
                <div className="rounded-3xl p-6 sm:p-8 border border-white/10" style={glassStyle}>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">Dezapegão</h1>
                        <p className="text-white/70 text-sm sm:text-base">Entre na sua conta</p>
                        {DEMO_MODE && (
                            <p className="text-xs text-yellow-300 mt-2 font-medium">
                                🔧 DEMO - Clique em Entrar
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && !DEMO_MODE && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required={!DEMO_MODE}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm sm:text-base"
                                placeholder={DEMO_MODE ? "demo@exemplo.com" : "seu@email.com"}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!DEMO_MODE}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm sm:text-base"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-purple-600 py-3 rounded-xl font-heading font-semibold hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-white/60 text-sm">
                            Não tem conta?{' '}
                            <Link href="/signup" className="text-white font-semibold hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to feed */}
                <Link href="/" className="block text-center mt-6 text-white/60 hover:text-white text-sm transition">
                    ← Voltar ao feed
                </Link>
            </div>
        </div>
    )
}
