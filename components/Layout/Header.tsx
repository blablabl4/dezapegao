'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE } from '@/lib/mock-data'

interface HeaderProps {
    user: any
}

export function Header({ user }: HeaderProps) {
    const router = useRouter()

    const handleSignOut = async () => {
        if (DEMO_MODE) {
            router.push('/login')
            return
        }

        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg" />
                    <span className="text-xl font-bold text-gray-900">Dezapegão</span>
                    {DEMO_MODE && <span className="text-xs bg-yellow-400 px-2 py-1 rounded">DEMO</span>}
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Meus anúncios
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="text-gray-600 hover:text-gray-900 text-sm"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition text-sm"
                            >
                                Cadastrar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
