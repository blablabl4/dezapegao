// Enhanced localStorage with complete user profile

export interface StoredListing {
    id: string
    user_id: string
    title: string
    description: string
    price: number
    category: string
    image_urls: string[]
    likes_count: number
    whatsapp_clicks: number
    status: 'active' | 'expired'
    location?: {
        cep: string
        bairro: string
        cidade: string
        estado: string
    }
    created_at: string
    updated_at: string
}

export interface StoredUser {
    id: string
    username: string
    email: string
    phone: string
    avatar_url?: string
    plan?: 'free' | 'basic' | 'pro' | 'premium'
    gender?: 'male' | 'female' | 'other' | 'prefer_not_say'
    birthdate?: string // YYYY-MM-DD
}

const LISTINGS_KEY = 'dezapegao_listings'
const CURRENT_USER_KEY = 'dezapegao_current_user'

export function getStoredListings(): StoredListing[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(LISTINGS_KEY)
    return data ? JSON.parse(data) : []
}

export function saveStoredListing(listing: Omit<StoredListing, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'whatsapp_clicks' | 'status'>) {
    const listings = getStoredListings()
    const newListing: StoredListing = {
        ...listing,
        id: Date.now().toString(),
        likes_count: 0,
        whatsapp_clicks: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
    listings.push(newListing)
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings))
    return newListing
}

export function updateStoredListing(id: string, updates: Partial<StoredListing>) {
    const listings = getStoredListings()
    const updated = listings.map(l =>
        l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    )
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated))
}

export function deleteStoredListing(id: string) {
    const listings = getStoredListings()
    const filtered = listings.filter(l => l.id !== id)
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(filtered))
}

export function getStoredListingById(id: string): StoredListing | null {
    const listings = getStoredListings()
    return listings.find(l => l.id === id) || null
}

export function getCurrentStoredUser(): StoredUser | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(CURRENT_USER_KEY)
    return data ? JSON.parse(data) : null
}

export function setCurrentStoredUser(user: StoredUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function updateCurrentStoredUser(updates: Partial<StoredUser>) {
    const user = getCurrentStoredUser()
    if (user) {
        const updated = { ...user, ...updates }
        setCurrentStoredUser(updated)
    }
}

export function clearCurrentStoredUser() {
    localStorage.removeItem(CURRENT_USER_KEY)
}

// FIXED: Weekly limit check - only counts ACTIVE listings
export function getActiveListingCount(userId: string): number {
    const listings = getStoredListings()
    return listings.filter(l =>
        l.user_id === userId &&
        l.status === 'active'
    ).length
}

export function canCreateListing(userId: string): boolean {
    const activeCount = getActiveListingCount(userId)
    return activeCount < 3
}

// CEP API integration
export async function fetchAddressFromCEP(cep: string) {
    const cleanCEP = cep.replace(/\D/g, '')
    if (cleanCEP.length !== 8) return null

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()

        if (data.erro) return null

        return {
            cep: cleanCEP,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        return null
    }
}
