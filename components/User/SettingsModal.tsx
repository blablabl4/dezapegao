'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { uploadAvatar } from '@/lib/storage'

const glassStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
}

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' },
    { value: 'prefer_not_say', label: 'Prefiro não dizer' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user, profile, updateProfile, refreshProfile } = useAuth()
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        gender: '',
        birthdate: '',
        currentPassword: '',
        newPassword: '',
    })
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && profile) {
            setAvatarPreview(profile.avatar_url || null)
            setFormData({
                username: profile.username || '',
                email: profile.email || user?.email || '',
                phone: profile.phone || '',
                gender: profile.gender || '',
                birthdate: profile.birthdate || '',
                currentPassword: '',
                newPassword: '',
            })
            setMessage('')
            setError('')
        }
    }, [isOpen, profile, user])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        if (file.size > 2 * 1024 * 1024) {
            setError('Foto deve ter no máximo 2MB')
            return
        }

        setUploadingAvatar(true)
        setError('')

        try {
            // Show preview immediately
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload to Supabase Storage
            const { url, error: uploadError } = await uploadAvatar(file, user.id)

            if (uploadError) {
                setError('Erro ao enviar foto: ' + uploadError.message)
                return
            }

            if (url) {
                // Update profile with new avatar URL
                await updateProfile({ avatar_url: url })
                await refreshProfile()
                setMessage('Foto atualizada!')
            }
        } catch (err) {
            setError('Erro ao enviar foto')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        setError('')
        setMessage('')

        try {
            const { error: updateError } = await updateProfile({
                username: formData.username,
                phone: formData.phone,
                gender: formData.gender as any,
                birthdate: formData.birthdate || null,
            })

            if (updateError) {
                setError('Erro ao salvar: ' + updateError.message)
            } else {
                await refreshProfile()
                setMessage('Dados salvos!')
            }
        } catch (err) {
            setError('Erro ao salvar alterações')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

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

                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Configurações</h1>

                    {message && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 text-green-200 rounded-xl text-sm text-center">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                                    {formData.username?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                            <label className={`absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition ${uploadingAvatar ? 'opacity-50' : ''}`}>
                                <span className="text-white text-sm">{uploadingAvatar ? '⏳' : '📷'}</span>
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
                            </label>
                        </div>
                        <p className="text-white/50 text-xs mt-2">Máx 2MB</p>
                    </div>

                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Nome de usuário</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                placeholder="Seu nome"
                            />
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm cursor-not-allowed"
                            />
                            <p className="text-white/40 text-xs mt-1">Email não pode ser alterado</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Telefone (WhatsApp)</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                placeholder="11999999999"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Sexo</label>
                            <div className="grid grid-cols-2 gap-2">
                                {genderOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: opt.value })}
                                        className={`px-4 py-3 rounded-xl text-sm transition ${formData.gender === opt.value
                                            ? 'bg-purple-500/50 border-purple-400 text-white'
                                            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                                            } border`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Birthdate */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Data de nascimento</label>
                            <input
                                type="date"
                                value={formData.birthdate}
                                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-white text-purple-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
