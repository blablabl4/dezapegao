'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_CATEGORIES } from '@/lib/categories'
import { useAuth } from '@/hooks/useAuth'
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

interface EditListingModalProps {
    isOpen: boolean
    onClose: () => void
    listingId: string | null
}

export function EditListingModal({ isOpen, onClose, listingId }: EditListingModalProps) {
    const router = useRouter()
    const { user, profile } = useAuth()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        cep: '',
    })
    const [location, setLocation] = useState<any>(null)
    const [loadingCEP, setLoadingCEP] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchListing = async () => {
            if (isOpen && listingId) {
                setLoading(true)
                try {
                    const response = await fetch(`/api/listings/${listingId}`)
                    const { listing, error } = await response.json()

                    if (error) throw new Error(error)

                    setFormData({
                        title: listing.title,
                        description: listing.description || '',
                        price: listing.price.toString(),
                        category: listing.category,
                        cep: formatCEP(listing.cep),
                    })
                    setLocation({
                        city: listing.city,
                        state: listing.state,
                        neighborhood: listing.neighborhood
                    })
                } catch (err: any) {
                    setError('Erro ao carregar anúncio')
                    logger.error('listings', 'edit-fetch', err.message)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchListing()
    }, [isOpen, listingId])

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

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
        if (cleanCEP.length !== 8 || !location) {
            setError('CEP inválido')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`/api/listings/${listingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    cep: cleanCEP,
                    city: location.city,
                    state: location.state,
                    neighborhood: location.neighborhood,
                })
            })

            if (!response.ok) throw new Error('Erro ao atualizar anúncio')

            setTimeout(() => {
                setLoading(false)
                onClose()
                router.refresh()
            }, 300)
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar anúncio')
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este anúncio?')) return

        setLoading(true)
        try {
            const response = await fetch(`/api/listings/${listingId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Erro ao excluir anúncio')

            onClose()
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Erro ao excluir anúncio')
            setLoading(false)
        }
    }

    if (!isOpen || !listingId) return null

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

                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Editar Anúncio</h1>

                    {loading && !formData.title ? (
                        <div className="text-center py-20 text-white/50">Carregando...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}

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
                                    {ALL_CATEGORIES.slice(0, 8).map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                            className={`p-3 rounded-xl text-center transition ${formData.category === cat.value ? 'bg-purple-500/50 border-purple-400' : 'bg-white/10 border-white/20 hover:bg-white/20'} border flex flex-col items-center justify-center`}
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            <p className="text-[10px] text-white/80 mt-1">{cat.label}</p>
                                        </button>
                                    ))}
                                </div>
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
                                        📍 {location.neighborhood || location.bairro}, {location.city || location.cidade}/{location.state || location.estado}
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

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-xl font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
                                >
                                    Excluir
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-white text-purple-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
