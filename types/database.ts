// ============================================
// DEZAPEGÃO - DATABASE TYPES
// Gerado a partir de supabase/schema.sql
// ============================================

// ============================================
// ENUMS
// ============================================

export type UserPlan = 'free' | 'basic' | 'pro' | 'premium'
export type UserStatus = 'active' | 'suspended' | 'banned'
export type ListingStatus = 'active' | 'sold' | 'expired' | 'removed'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type GenderType = 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer'

// ============================================
// CATEGORIES (alinhado com lib/categories.ts)
// ============================================

export type CategoryType =
    | 'roupas'
    | 'eletronicos'
    | 'moveis'
    | 'eletrodomesticos'
    | 'brinquedos'
    | 'esportes'
    | 'veiculos'
    | 'livros'
    | 'jogos'
    | 'instrumentos'
    | 'ferramentas'
    | 'decoracao'
    | 'bebes'
    | 'beleza'
    | 'pets'
    | 'informatica'
    | 'celulares'
    | 'calcados'
    | 'acessorios'
    | 'cozinha'
    | 'jardim'
    | 'servicos'
    | 'outros'

// ============================================
// TABLE TYPES
// ============================================

// --- PROFILES ---

export interface Profile {
    id: string
    username: string
    email: string
    phone: string
    avatar_url: string | null
    gender: GenderType | null
    birthdate: string | null
    city: string | null
    state: string | null
    plan: UserPlan
    status: UserStatus
    created_at: string
    updated_at: string
}

export interface ProfileInsert {
    id: string
    username: string
    email: string
    phone: string
    avatar_url?: string | null
    gender?: GenderType | null
    birthdate?: string | null
    city?: string | null
    state?: string | null
    plan?: UserPlan
    status?: UserStatus
}

export interface ProfileUpdate {
    username?: string
    email?: string
    phone?: string
    avatar_url?: string | null
    gender?: GenderType | null
    birthdate?: string | null
    city?: string | null
    state?: string | null
    plan?: UserPlan
    status?: UserStatus
}

// --- LISTINGS ---

export interface Listing {
    id: string
    user_id: string
    title: string
    description: string | null
    price: number
    category: string
    cep: string | null
    city: string | null
    state: string | null
    neighborhood: string | null
    status: ListingStatus
    views_count: number
    likes_count: number
    whatsapp_clicks: number
    expires_at: string | null
    created_at: string
    updated_at: string
}

export interface ListingInsert {
    user_id: string
    title: string
    description?: string | null
    price: number
    category: string
    cep?: string | null
    city?: string | null
    state?: string | null
    neighborhood?: string | null
    status?: ListingStatus
    expires_at?: string | null
}

export interface ListingUpdate {
    title?: string
    description?: string | null
    price?: number
    category?: string
    cep?: string | null
    city?: string | null
    state?: string | null
    neighborhood?: string | null
    status?: ListingStatus
    expires_at?: string | null
}

// --- LISTING IMAGES ---

export interface ListingImage {
    id: string
    listing_id: string
    image_url: string
    thumbnail_url: string | null
    position: number
    created_at: string
}

export interface ListingImageInsert {
    listing_id: string
    image_url: string
    thumbnail_url?: string | null
    position?: number
}

// --- LIKES ---

export interface Like {
    id: string
    user_id: string
    listing_id: string
    created_at: string
}

export interface LikeInsert {
    user_id: string
    listing_id: string
}

// --- ANALYTICS EVENTS ---

export interface AnalyticsEvent {
    id: string
    event_type: string
    listing_id: string | null
    user_id: string | null
    metadata: Record<string, unknown> | null
    created_at: string
}

export interface AnalyticsEventInsert {
    event_type: string
    listing_id?: string | null
    user_id?: string | null
    metadata?: Record<string, unknown> | null
}

// --- REPORTS ---

export interface Report {
    id: string
    reporter_id: string
    listing_id: string | null
    reported_user_id: string | null
    reason: string
    description: string | null
    status: ReportStatus
    created_at: string
    updated_at: string
}

export interface ReportInsert {
    reporter_id: string
    listing_id?: string | null
    reported_user_id?: string | null
    reason: string
    description?: string | null
}

// --- SUBSCRIPTIONS ---

export interface Subscription {
    id: string
    user_id: string
    plan: UserPlan
    payment_provider: string | null
    external_id: string | null
    status: string
    current_period_start: string | null
    current_period_end: string | null
    created_at: string
    updated_at: string
}

// --- ONBOARDING RESPONSES ---

export interface OnboardingResponse {
    id: string
    user_id: string
    question: string
    answer: string
    created_at: string
}

// ============================================
// COMPOSITE / JOIN TYPES
// ============================================

/** Listing com profile do vendedor (usado no feed) */
export interface ListingWithProfile extends Listing {
    profiles: Pick<Profile, 'id' | 'username' | 'phone' | 'avatar_url'>
    /** Alias from Supabase join: images:listing_images(*) */
    images?: ListingImage[]
    /** Alias from Supabase join: profile:profiles(...) */
    profile?: Pick<Profile, 'id' | 'username' | 'phone' | 'avatar_url'>
    /** Mapped convenience field (set by homepage transform) */
    image_url?: string
}

/** Listing com profile e imagens */
export interface ListingWithImages extends Listing {
    listing_images: ListingImage[]
    images?: ListingImage[]
}

/** Listing completa (feed + imagens) */
export interface ListingFull extends ListingWithProfile {
    listing_images: ListingImage[]
}

// ============================================
// SUPABASE DATABASE TYPE (para createClient genérico)
// ============================================

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile
                Insert: ProfileInsert
                Update: ProfileUpdate
            }
            listings: {
                Row: Listing
                Insert: ListingInsert
                Update: ListingUpdate
            }
            listing_images: {
                Row: ListingImage
                Insert: ListingImageInsert
                Update: Partial<ListingImageInsert>
            }
            likes: {
                Row: Like
                Insert: LikeInsert
                Update: never
            }
            analytics_events: {
                Row: AnalyticsEvent
                Insert: AnalyticsEventInsert
                Update: never
            }
            reports: {
                Row: Report
                Insert: ReportInsert
                Update: { status?: ReportStatus }
            }
            subscriptions: {
                Row: Subscription
                Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>
            }
            onboarding_responses: {
                Row: OnboardingResponse
                Insert: Omit<OnboardingResponse, 'id' | 'created_at'>
                Update: never
            }
        }
    }
}
