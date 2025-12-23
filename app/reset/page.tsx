'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPage() {
    const [status, setStatus] = useState('Iniciando limpeza...')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const clearEverything = async () => {
            try {
                // 1. Sign out from Supabase (global scope)
                setStatus('Deslogando do Supabase...')
                await supabase.auth.signOut({ scope: 'global' })

                // 2. Clear Local Storage
                setStatus('Limpando Local Storage...')
                localStorage.clear()

                // 3. Clear Session Storage
                setStatus('Limpando Session Storage...')
                sessionStorage.clear()

                // 4. Clear Cookies (basic attempt)
                setStatus('Limpando Cookies...')
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // 5. Finalize
                setStatus('✅ Limpeza completa! Redirecionando...')

                // Force reload to home after 2 seconds
                setTimeout(() => {
                    window.location.href = '/'
                }, 2000)

            } catch (error) {
                console.error(error)
                setStatus('❌ Erro: ' + String(error))
            }
        }

        clearEverything()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center space-y-4 p-8 bg-gray-800 rounded-xl">
                <h1 className="text-3xl font-bold text-red-500">Reset Geral 🧹</h1>
                <p className="text-xl animate-pulse">{status}</p>
                <p className="text-sm text-gray-400">Isso remove todos os dados locais e desloga você.</p>
            </div>
        </div>
    )
}
