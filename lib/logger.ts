'use client'

// Centralized logging system for Dezapegão
// Supports console logging in dev and can be extended for external services (Sentry, etc.)

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type EventCategory = 'auth' | 'listings' | 'storage' | 'navigation' | 'api' | 'user_action'

interface LogEvent {
    level: LogLevel
    category: EventCategory
    action: string
    message: string
    data?: Record<string, unknown>
    userId?: string
    timestamp: string
    duration?: number
}

interface TimerData {
    start: number
    category: EventCategory
    action: string
}

// Store for active timers
const activeTimers: Map<string, TimerData> = new Map()

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

// Format log for console
function formatLog(event: LogEvent): string {
    const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
    }[event.level]

    const categoryEmoji = {
        auth: '🔐',
        listings: '📦',
        storage: '💾',
        navigation: '🧭',
        api: '🌐',
        user_action: '👆'
    }[event.category]

    return `${emoji} [${event.category.toUpperCase()}] ${categoryEmoji} ${event.action}: ${event.message}`
}

// Core logging function
function log(event: Omit<LogEvent, 'timestamp'>): void {
    const fullEvent: LogEvent = {
        ...event,
        timestamp: new Date().toISOString()
    }

    // Console logging (always in dev, errors always)
    if (isDev || event.level === 'error') {
        const formatted = formatLog(fullEvent)
        const logFn = {
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error
        }[event.level]

        if (event.data) {
            logFn(formatted, event.data)
        } else {
            logFn(formatted)
        }
    }

    // Store in sessionStorage for debugging (last 50 events)
    if (typeof window !== 'undefined') {
        try {
            const stored = sessionStorage.getItem('app_logs')
            const logs: LogEvent[] = stored ? JSON.parse(stored) : []
            logs.push(fullEvent)
            // Keep only last 50
            while (logs.length > 50) logs.shift()
            sessionStorage.setItem('app_logs', JSON.stringify(logs))
        } catch {
            // Ignore storage errors
        }
    }

    // TODO: Send to external service (Sentry, etc.) for production
    // if (!isDev && event.level === 'error') {
    //     sendToSentry(fullEvent)
    // }
}

// Public API
export const logger = {
    debug: (category: EventCategory, action: string, message: string, data?: Record<string, unknown>) => {
        log({ level: 'debug', category, action, message, data })
    },

    info: (category: EventCategory, action: string, message: string, data?: Record<string, unknown>) => {
        log({ level: 'info', category, action, message, data })
    },

    warn: (category: EventCategory, action: string, message: string, data?: Record<string, unknown>) => {
        log({ level: 'warn', category, action, message, data })
    },

    error: (category: EventCategory, action: string, message: string, error?: unknown, data?: Record<string, unknown>) => {
        const errorData = error instanceof Error
            ? { errorMessage: error.message, errorStack: error.stack, ...data }
            : { error, ...data }
        log({ level: 'error', category, action, message, data: errorData })
    },

    // Timer utilities for measuring operations
    startTimer: (id: string, category: EventCategory, action: string) => {
        activeTimers.set(id, { start: performance.now(), category, action })
    },

    endTimer: (id: string, message: string, data?: Record<string, unknown>) => {
        const timer = activeTimers.get(id)
        if (timer) {
            const duration = Math.round(performance.now() - timer.start)
            activeTimers.delete(id)
            log({
                level: 'info',
                category: timer.category,
                action: timer.action,
                message: `${message} (${duration}ms)`,
                duration,
                data
            })
        }
    },

    // Auth-specific helpers
    auth: {
        login: (email: string, success: boolean, error?: unknown) => {
            if (success) {
                log({ level: 'info', category: 'auth', action: 'login', message: 'Login successful', data: { email: email.substring(0, 3) + '***' } })
            } else {
                log({ level: 'error', category: 'auth', action: 'login', message: 'Login failed', data: { email: email.substring(0, 3) + '***', error: error instanceof Error ? error.message : String(error) } })
            }
        },
        signup: (email: string, success: boolean, error?: unknown) => {
            if (success) {
                log({ level: 'info', category: 'auth', action: 'signup', message: 'Signup successful', data: { email: email.substring(0, 3) + '***' } })
            } else {
                log({ level: 'error', category: 'auth', action: 'signup', message: 'Signup failed', data: { email: email.substring(0, 3) + '***', error: error instanceof Error ? error.message : String(error) } })
            }
        },
        logout: (success: boolean, error?: unknown) => {
            if (success) {
                log({ level: 'info', category: 'auth', action: 'logout', message: 'Logout successful' })
            } else {
                log({ level: 'error', category: 'auth', action: 'logout', message: 'Logout failed', data: { error: error instanceof Error ? error.message : String(error) } })
            }
        }
    },

    // Get stored logs for debugging
    getLogs: (): LogEvent[] => {
        if (typeof window === 'undefined') return []
        try {
            const stored = sessionStorage.getItem('app_logs')
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    },

    // Clear stored logs
    clearLogs: () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('app_logs')
        }
    }
}

// Export type for external use
export type { LogEvent, EventCategory, LogLevel }
