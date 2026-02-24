'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import type { CategoryType } from '@/types/database'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

const categories: { value: CategoryType; label: string; icon: string }[] = [
    { value: 'roupas', label: 'Roupas', icon: '👕' },
    { value: 'eletronicos', label: 'Eletrônicos', icon: '📱' },
    { value: 'moveis', label: 'Móveis', icon: '🛋️' },
    { value: 'eletrodomesticos', label: 'Eletrodom.', icon: '🔌' },
    { value: 'brinquedos', label: 'Brinquedos', icon: '🧸' },
    { value: 'esportes', label: 'Esportes', icon: '⚽' },
    { value: 'veiculos', label: 'Veículos', icon: '🚗' },
    { value: 'outros', label: 'Outros', icon: '📦' },
]

export default function NewListingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '' as CategoryType,
    })
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (images.length + files.length > 3) {
            setError('Máximo 3 fotos')
            return
        }

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Cada foto deve ter no máximo 5MB')
                return false
            }
            return true
        })

        setImages([...images, ...validFiles])
        setImagePreviews([...imagePreviews, ...validFiles.map(f => URL.createObjectURL(f))])
        setError('')
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
        setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!user) {
            setError('Você precisa estar logado para criar um anúncio.')
            return
        }

        if (images.length === 0) {
            setError('Adicione pelo menos 1 foto')
            return
        }

        if (!formData.title || formData.title.length < 5) {
            setError('Título deve ter pelo menos 5 caracteres')
            return
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Preço inválido')
            return
        }

        if (!formData.category) {
            setError('Selecione uma categoria')
            return
        }

        setLoading(true)

        try {
            // Upload images to R2
            const imageUrls: string[] = []
            for (const file of images) {
                const uploadForm = new FormData()
                uploadForm.append('file', file)
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadForm,
                })
                if (!uploadRes.ok) throw new Error('Erro ao fazer upload da imagem')
                const { url } = await uploadRes.json()
                imageUrls.push(url)
            }

            // Create listing via API
            const res = await fetch('/api/listings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    imageUrls,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erro ao criar anúncio')
            }

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Erro ao criar anúncio')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900" />

            <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard" className="text-white/70 hover:text-white text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar
                    </Link>
                    <Link href="/" className="text-white/50 hover:text-white">✕</Link>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Criar Anúncio</h1>
                <p className="text-white/60 text-sm mb-6">💡 Use fotos em retrato (vertical)</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Fotos ({images.length}/3)
                        </label>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {imagePreviews.map((preview, i) => (
                                    <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden" style={glassStyle}>
                                        <img src={preview} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                            {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 3 && (
                            <>
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="image-upload" />
                                <label htmlFor="image-upload" className="block rounded-2xl cursor-pointer py-8 text-center" style={glassStyle}>
                                    <svg className="mx-auto h-10 w-10 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-sm text-white/60">Adicionar foto</p>
                                    <p className="text-xs text-white/40 mt-1">Máx 5MB cada</p>
                                </label>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Título</label>
                        <input
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength={80}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                            placeholder="Ex: Mesa de madeira"
                        />
                        <p className="text-xs text-white/40 mt-1">{formData.title.length}/80</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Categoria</label>
                        <div className="grid grid-cols-4 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    className={`p-3 rounded-xl text-center transition ${formData.category === cat.value ? 'bg-purple-500/50 border-purple-400' : 'bg-white/10 border-white/20 hover:bg-white/20'} border`}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <p className="text-xs text-white/80 mt-1">{cat.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Preço</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-lg font-bold"
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            Descrição <span className="text-white/40">(opcional)</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={500}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition resize-none text-sm"
                            placeholder="Descreva o produto..."
                        />
                        <p className="text-xs text-white/40 mt-1">{formData.description.length}/500</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-purple-600 py-4 rounded-2xl font-semibold hover:bg-white/90 transition disabled:opacity-50"
                    >
                        {loading ? 'Publicando...' : 'Publicar Anúncio'}
                    </button>
                </form>
            </div>
        </div>
    )
}
