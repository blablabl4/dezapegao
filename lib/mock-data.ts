// Mock data for development and seeding purposes

export const DEMO_MODE = false

export const MOCK_USER = {
    id: 'demo-user-123',
    email: 'demo@dezapegao.com',
    user_metadata: {
        username: 'usuario_demo',
        phone: '+5511999999999',
    },
}

export const MOCK_PROFILE = {
    id: 'demo-user-123',
    username: 'usuario_demo',
    phone: '+5511999999999',
    plan: 'free' as const,
    ads_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}

export const MOCK_LISTINGS: any[] = []
