'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'info'
    duration?: number
    onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 300) // Wait for fade out animation
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const styles = {
        success: {
            container: 'border-green-500/30 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]',
            icon: 'text-green-400',
            text: 'text-green-100'
        },
        error: {
            container: 'border-red-500/30 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]',
            icon: 'text-red-400',
            text: 'text-red-100'
        },
        info: {
            container: 'border-blue-500/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]',
            icon: 'text-blue-400',
            text: 'text-blue-100'
        }
    }

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    }

    return (
        <div
            className={`fixed top-4 right-4 z-[9999] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                }`}
        >
            <div className={`
                backdrop-blur-xl bg-black/60 border 
                ${styles[type].container}
                px-6 py-4 rounded-2xl flex items-center gap-4 min-w-[320px] max-w-sm
            `}>
                <span className="text-xl">{icons[type]}</span>
                <p className={`font-medium text-sm ${styles[type].text}`}>{message}</p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-auto text-white/40 hover:text-white transition"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
