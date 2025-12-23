import { z } from 'zod'

// Category schema
export const categorySchema = z.enum([
    'roupas',
    'eletronicos',
    'moveis',
    'eletrodomesticos',
    'brinquedos',
    'esportes',
    'veiculos',
    'outros',
])

// Listing creation schema
export const createListingSchema = z.object({
    title: z
        .string()
        .min(5, 'Título deve ter pelo menos 5 caracteres')
        .max(80, 'Título deve ter no máximo 80 caracteres'),
    description: z
        .string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional(),
    price: z
        .number()
        .positive('Preço deve ser maior que zero')
        .or(z.string().transform((val) => parseFloat(val))),
    category: categorySchema,
    image: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'Imagem deve ter no máximo 5MB')
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            'Apenas imagens JPG, PNG ou WebP são permitidas'
        ),
})

// Profile update schema
export const updateProfileSchema = z.object({
    username: z
        .string()
        .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
        .max(30, 'Nome de usuário deve ter no máximo 30 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e underscore'),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
        .optional(),
})

// Auth schemas
export const signUpSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    username: z
        .string()
        .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
        .max(30, 'Nome de usuário deve ter no máximo 30 caracteres'),
    phone: z.string().optional(),
})

export const signInSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
})

// Type exports
export type CreateListingInput = z.infer<typeof createListingSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
