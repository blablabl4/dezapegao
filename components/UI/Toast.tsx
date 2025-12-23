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

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
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
            <div className={`${bgColors[type]} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px]`}>
                <span className="text-xl">{icons[type]}</span>
                <p className="font-medium text-sm">{message}</p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-auto text-white/60 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
