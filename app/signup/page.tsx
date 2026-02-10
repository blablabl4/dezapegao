'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { signUpSchema, type SignUpInput } from '@/lib/validation'
import { DEMO_MODE } from '@/lib/mock-data'
import { setCurrentStoredUser } from '@/lib/local-storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
}

const genderOptions = [
    { value: 'male', label: 'Masc' },
    { value: 'female', label: 'Fem' },
    { value: 'other', label: 'Outro' },
    { value: 'prefer_not_say', label: 'N/A' },
]

export default function SignUpPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        phone: '',
        gender: '',
        birthdate: '',
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
            if (DEMO_MODE) {
                // Save to localStorage in demo mode
                setCurrentStoredUser({
                    id: Date.now().toString(),
                    username: formData.username || 'usuario_demo',
                    email: formData.email || 'demo@dezapegao.com',
                    phone: formData.phone || '+5511999999999',
                    gender: formData.gender as any || undefined,
                    birthdate: formData.birthdate || undefined,
                    plan: 'free',
                })
                router.push('/')
                router.refresh()
                return
            }

            const data: SignUpInput = {
                email: formData.email,
                password: formData.password,
                username: formData.username,
                phone: formData.phone,
            }
            signUpSchema.parse(data)

            // Usa useAuth.signUp que cria TANTO o auth user QUANTO o profile no DB
            const { error: signUpError } = await signUp(
                formData.email,
                formData.password,
                {
                    username: formData.username,
                    phone: formData.phone,
                    gender: formData.gender || undefined,
                }
            )

            if (signUpError) {
                setError(signUpError.message)
                return
            }

            router.push('/')
            router.refresh()
        } catch (err: any) {
            if (err.errors) {
                setError(err.errors[0].message)
            } else {
                setError('Erro ao criar conta. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />

            <div className="w-full max-w-sm relative z-10">
                <div className="rounded-3xl p-6 sm:p-8 border border-white/10" style={glassStyle}>
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">Dezapegão</h1>
                        <p className="text-white/70 text-sm">Crie sua conta grátis</p>
                        <div className="mt-3 bg-green-500/20 border border-green-500/30 text-green-200 px-3 py-1.5 rounded-full text-xs font-medium inline-block">
                            🎉 3 anúncios/semana grátis!
                        </div>
                        {DEMO_MODE && (
                            <p className="text-xs text-yellow-300 mt-2 font-medium">
                                🔧 DEMO - Preencha para testar
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && !DEMO_MODE && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-1.5">
                                Nome de usuário
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                required={!DEMO_MODE}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm"
                                placeholder="seu_usuario"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required={!DEMO_MODE}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1.5">
                                WhatsApp <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required={!DEMO_MODE}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm"
                                placeholder="+5511999999999"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1.5">
                                Sexo <span className="text-white/40">(opcional)</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {genderOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: opt.value })}
                                        className={`px-2 py-2 rounded-xl text-xs transition ${formData.gender === opt.value
                                            ? 'bg-purple-500/50 border-purple-400 text-white'
                                            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                                            } border`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Birthdate */}
                        <div>
                            <label htmlFor="birthdate" className="block text-sm font-medium text-white/80 mb-1.5">
                                Data de nascimento <span className="text-white/40">(opcional)</span>
                            </label>
                            <input
                                id="birthdate"
                                name="birthdate"
                                type="date"
                                value={formData.birthdate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!DEMO_MODE}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent transition text-sm"
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-white/50 mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-purple-600 py-3 rounded-xl font-heading font-semibold hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Criando...' : 'Criar conta grátis'}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <p className="text-white/60 text-sm">
                            Já tem conta?{' '}
                            <Link href="/login" className="text-white font-semibold hover:underline">
                                Entrar
                            </Link>
                        </p>
                    </div>

                    <p className="text-center text-xs text-white/40 mt-4">
                        Ao criar conta você aceita os termos de uso
                    </p>
                </div>

                <Link href="/" className="block text-center mt-6 text-white/60 hover:text-white text-sm transition">
                    ← Voltar ao feed
                </Link>
            </div>
        </div>
    )
}
