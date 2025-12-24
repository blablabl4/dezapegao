'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_CATEGORIES, DEFAULT_CATEGORIES } from '@/lib/categories'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

const formatCEP = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 8)
    if (nums.length > 5) return `${nums.slice(0, 5)}-${nums.slice(5)}`
    return nums
}

const formatPrice = (value: string) => {
    const nums = value.replace(/\D/g, '')
    if (!nums) return ''
    const decimal = (parseFloat(nums) / 100).toFixed(2)
    return decimal
}

interface NewListingModalProps {
    isOpen: boolean
    onClose: () => void
}

export function NewListingModal({ isOpen, onClose }: NewListingModalProps) {
    const router = useRouter()
    const { user, profile } = useAuth()
    const [showAllCategories, setShowAllCategories] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        cep: '',
    })
    const [location, setLocation] = useState<any>(null)
    const [loadingCEP, setLoadingCEP] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeCount, setActiveCount] = useState(0)
    const supabaseClient = createClient()

    useEffect(() => {
        if (isOpen && user) {
            resetForm()
            fetchActiveCount()
        }
    }, [isOpen, user])

    const fetchActiveCount = async () => {
        if (!user) return
        const { count, error } = await supabaseClient
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'active')

        if (!error && count !== null) {
            setActiveCount(count)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            category: '',
            cep: '',
        })
        setLocation(null)
        setImages([])
        setImagePreviews([])
        setError('')
        setLoading(false)
        setShowAllCategories(false)
    }

    const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCEP(e.target.value)
        setFormData({ ...formData, cep: formatted })

        const cleanCEP = formatted.replace(/\D/g, '')
        if (cleanCEP.length === 8) {
            setLoadingCEP(true)
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
                const data = await response.json()
                setLoadingCEP(false)

                if (!data.erro) {
                    setLocation({
                        city: data.localidade,
                        state: data.uf,
                        neighborhood: data.bairro
                    })
                    setError('')
                } else {
                    setError('CEP não encontrado')
                    setLocation(null)
                }
            } catch (err) {
                setError('Erro ao buscar CEP')
                setLoadingCEP(false)
            }
        }
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPrice(e.target.value)
        setFormData({ ...formData, price: formatted })
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            if (images.length + newFiles.length > 3) {
                setError('Máximo de 3 fotos permitidas')
                return
            }

            const validFiles: File[] = []

            for (const file of newFiles) {
                // Check file size (2MB max for better mobile performance)
                if (file.size > 2 * 1024 * 1024) {
                    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
                    setError(`⚠️ Foto "${file.name}" tem ${sizeMB}MB. Máximo: 2MB`)
                    continue
                }

                // Check if it's actually an image
                if (!file.type.startsWith('image/')) {
                    setError(`⚠️ "${file.name}" não é uma imagem válida`)
                    continue
                }

                validFiles.push(file)
            }

            if (validFiles.length === 0) return

            setImages([...images, ...validFiles])

            // Create previews
            const newPreviews = validFiles.map(file => URL.createObjectURL(file))
            setImagePreviews([...imagePreviews, ...newPreviews])
            if (validFiles.length === newFiles.length) {
                setError('')
            }
        }
    }

    const removeImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)

        const newPreviews = [...imagePreviews]
        URL.revokeObjectURL(newPreviews[index]) // Revoke object URL to prevent memory leaks
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validations
        const maxListings = profile?.plan === 'pro' ? 10 : profile?.plan === 'premium' ? 20 : 3

        if (activeCount >= maxListings) {
            setError(`Limite de anúncios ativos atingido! (${activeCount}/${maxListings})`)
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

        const cleanCEP = formData.cep.replace(/\D/g, '')
        if (cleanCEP.length !== 8) {
            setError('CEP inválido')
            return
        }

        if (!location) {
            setError('Busque o CEP primeiro')
            return
        }

        setLoading(true)

        try {
            if (!user) throw new Error('User not authenticated')

            // 1. Create Listing Record
            const { data: listingData, error: listingError } = await supabaseClient
                .from('listings')
                .insert({
                    user_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    city: location.city,
                    state: location.state,
                    status: 'active'
                })
                .select()
                .single()

            if (listingError) throw listingError

            // 2. Upload Images
            const uploadPromises = images.map(async (file, index) => {
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${listingData.id}/${index}_${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabaseClient.storage
                    .from('listings')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                // Get Public URL
                const { data: { publicUrl } } = supabaseClient.storage
                    .from('listings')
                    .getPublicUrl(fileName)

                return {
                    listing_id: listingData.id,
                    image_url: publicUrl,
                    display_order: index
                }
            })

            const uploadedImages = await Promise.all(uploadPromises)

            // 3. Save Images to DB
            const { error: imagesError } = await supabaseClient
                .from('listing_images')
                .insert(uploadedImages)

            if (imagesError) throw imagesError

            // Success
            setTimeout(() => {
                resetForm()
                onClose()
                router.refresh()
            }, 300)

        } catch (err: any) {
            logger.error('listing', 'create', 'Error creating listing', err)
            setError(err.message || 'Erro ao criar anúncio')
            setLoading(false)
        }
    }

    if (!isOpen) return null
    if (!profile) return null // Wait for profile

    const maxListings = profile.plan === 'pro' ? 10 : profile.plan === 'premium' ? 20 : 3
    const canCreate = activeCount < maxListings

    // Categories to show
    const defaultCats = ALL_CATEGORIES.filter(c => DEFAULT_CATEGORIES.includes(c.value as any))
    const categoriesToShow = showAllCategories ? ALL_CATEGORIES : defaultCats

    return (
        <>
            <div
                className="fixed top-14 left-0 right-0 bottom-0 bg-black/50 z-40"
                style={{ backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            />

            <div className="fixed top-14 left-0 right-0 bottom-0 z-50 overflow-y-auto">
                <div className="min-h-full max-w-lg mx-auto px-4 py-6" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-white/10 transition"
                        style={glassStyle}
                    >
                        <div className="w-full h-full flex items-center justify-center text-white/80 hover:text-white text-xl">
                            ✕
                        </div>
                    </button>

                    <h1 className="text-2xl font-bold text-white mb-2 text-center">Criar Anúncio</h1>
                    <p className="text-white/60 text-sm mb-2 text-center">💡 Use fotos em retrato (vertical)</p>
                    <p className="text-xs text-white/50 mb-6 text-center">
                        {activeCount}/3 anúncios ativos
                    </p>

                    {!canCreate ? (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 text-center">
                            <p className="text-white text-lg mb-2">⚠️ Limite Atingido</p>
                            <p className="text-white/80 text-sm">
                                Você tem 3 anúncios ativos. Exclua ou venda um para criar outro.
                            </p>
                            <button
                                className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
                            >
                                Fazer upgrade
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Fotos ({images.length}/3)</label>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {imagePreviews.map((preview, i) => (
                                            <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden" style={glassStyle}>
                                                <img src={preview} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(i)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                >
                                                    <div className="w-full h-full flex items-center justify-center text-xs">✕</div>
                                                </button>
                                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center justify-center">
                                                    {i + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length < 3 && (
                                    <>
                                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="image-upload" />
                                        <label htmlFor="image-upload" className="block rounded-xl cursor-pointer py-8 text-center" style={glassStyle}>
                                            <svg className="mx-auto h-10 w-10 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <p className="text-sm text-white/60">Adicionar foto</p>
                                            <p className="text-xs text-white/40 mt-1">Máx 2MB cada</p>
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
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Categoria</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {categoriesToShow.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                            className={`p-2 rounded-xl text-center transition ${formData.category === cat.value ? 'bg-purple-500/50 border-purple-400' : 'bg-white/10 border-white/20 hover:bg-white/20'} border flex flex-col items-center justify-center`}
                                        >
                                            <span className="text-lg">{cat.icon}</span>
                                            <p className="text-[10px] text-white/80 mt-1 leading-tight">{cat.label}</p>
                                        </button>
                                    ))}
                                </div>
                                {!showAllCategories && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllCategories(true)}
                                        className="w-full mt-2 py-2 text-sm text-white/60 hover:text-white/80 transition"
                                    >
                                        Ver mais categorias ▼
                                    </button>
                                )}
                                {showAllCategories && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllCategories(false)}
                                        className="w-full mt-2 py-2 text-sm text-white/60 hover:text-white/80 transition"
                                    >
                                        Ver menos ▲
                                    </button>
                                )}
                            </div>

                            {/* CEP */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">CEP</label>
                                <input
                                    name="cep"
                                    type="text"
                                    value={formData.cep}
                                    onChange={handleCEPChange}
                                    required
                                    maxLength={9}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                    placeholder="00000-000"
                                />
                                {loadingCEP && <p className="text-xs text-white/60 mt-1">Buscando...</p>}
                                {location && (
                                    <p className="text-xs text-green-400 mt-1">
                                        📍 {location.bairro}, {location.cidade}/{location.estado}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Preço</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                                    <input
                                        name="price"
                                        type="text"
                                        value={formData.price}
                                        onChange={handlePriceChange}
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
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-purple-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? 'Publicando...' : 'Publicar Anúncio'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
