export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type CategoryType =
    | 'roupas'
    | 'eletronicos'
    | 'moveis'
    | 'eletrodomesticos'
    | 'brinquedos'
    | 'esportes'
    | 'veiculos'
    | 'outros'

export type PlanType = 'free' | 'basic' | 'pro' | 'premium'

export type ListingStatus = 'active' | 'expired' | 'removed'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    phone: string | null
                    plan: PlanType
                    ads_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    phone?: string | null
                    plan?: PlanType
                    ads_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    phone?: string | null
                    plan?: PlanType
                    ads_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            listings: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    price: number
                    category: CategoryType
                    image_url: string
                    likes_count: number
                    whatsapp_clicks: number
                    status: ListingStatus
                    expires_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    price: number
                    category: CategoryType
                    image_url: string
                    likes_count?: number
                    whatsapp_clicks?: number
                    status?: ListingStatus
                    expires_at: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    price?: number
                    category?: CategoryType
                    image_url?: string
                    likes_count?: number
                    whatsapp_clicks?: number
                    status?: ListingStatus
                    expires_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            likes: {
                Row: {
                    id: string
                    user_id: string
                    listing_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    listing_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    listing_id?: string
                    created_at?: string
                }
            }
        }
    }
}

// Helper types for easier querying
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Like = Database['public']['Tables']['likes']['Row']

// Types with relations
export type ListingWithProfile = Listing & {
    profiles: Profile
}

export type ListingWithLikes = Listing & {
    likes: Like[]
    isLikedByUser?: boolean
}
