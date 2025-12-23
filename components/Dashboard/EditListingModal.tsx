'use client'

import { useState, useEffect } from 'react'
import type { CategoryType } from '@/types/database'
import { getStoredListingById, updateStoredListing, fetchAddressFromCEP } from '@/lib/local-storage'

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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '' as CategoryType,
        cep: '',
    })
    const [location, setLocation] = useState<any>(null)
    const [loadingCEP, setLoadingCEP] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && listingId) {
            const listing = getStoredListingById(listingId)
            if (listing) {
                setFormData({
                    title: listing.title,
                    description: listing.description,
                    price: listing.price.toFixed(2),
                    category: listing.category as CategoryType,
                    cep: listing.location ? formatCEP(listing.location.cep) : '',
                })
                if (listing.location) {
                    setLocation(listing.location)
                }
            }
        }
    }, [isOpen, listingId])

    const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCEP(e.target.value)
        setFormData({ ...formData, cep: formatted })

        const cleanCEP = formatted.replace(/\D/g, '')
        if (cleanCEP.length === 8) {
            setLoadingCEP(true)
            const addressData = await fetchAddressFromCEP(cleanCEP)
            setLoadingCEP(false)

            if (addressData) {
                setLocation(addressData)
                setError('')
            } else {
                setError('CEP não encontrado')
                setLocation(null)
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
            if (listingId) {
                updateStoredListing(listingId, {
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    location: location,
                })
            }

            setTimeout(() => {
                setLoading(false)
                onClose()
            }, 300)
        } catch (err) {
            setError('Erro ao atualizar anúncio')
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
                    {/* Consistent header */}
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
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.value })}
                                        className={`p-3 rounded-xl text-center transition ${formData.category === cat.value ? 'bg-purple-500/50 border-purple-400' : 'bg-white/10 border-white/20 hover:bg-white/20'} border flex flex-col items-center justify-center`}
                                    >
                                        <span className="text-xl">{cat.icon}</span>
                                        <p className="text-xs text-white/80 mt-1">{cat.label}</p>
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
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
