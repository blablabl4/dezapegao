'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

export default function ResetPage() {
    const [status, setStatus] = useState('Iniciando limpeza...')

    useEffect(() => {
        const clearEverything = async () => {
            try {
                // 1. Clean Local Data
                setStatus('Limpando dados locais...')
                localStorage.clear()
                sessionStorage.clear()

                // Clear cookies
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // 2. Sign out from NextAuth
                setStatus('Deslogando...')
                await signOut({ redirect: false })

                // 3. Finalize
                setStatus('✅ Limpeza completa! Redirecionando...')

            } catch (error) {
                console.error(error)
                setStatus('⚠️ Aviso: ' + String(error))
            } finally {
                setTimeout(() => {
                    window.location.href = '/'
                }, 1000)
            }
        }

        clearEverything()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center space-y-4 p-8 bg-gray-800 rounded-xl">
                <h1 className="text-3xl font-bold text-red-500">Reset Geral 🧹</h1>
                <p className="text-xl animate-pulse">{status}</p>
                <div className="text-sm text-gray-400 max-w-md mx-auto">
                    <p>1. Limpa localStorage e Cookies</p>
                    <p>2. Desloga do NextAuth</p>
                    <p>3. Redireciona para Home</p>
                </div>
            </div>
        </div>
    )
}
