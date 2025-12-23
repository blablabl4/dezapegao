'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { uploadAvatar } from '@/lib/storage'
import { Toast } from '@/components/UI/Toast'

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
        phone: '',
        gender: '',
        birthdate: '',
        currentPassword: '',
        newPassword: '',
    })
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    // Configuração do Toast
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'info'
    })

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ show: true, message, type })
    }

    useEffect(() => {
        if (isOpen && profile) {
            setAvatarPreview(profile.avatar_url || null)
            setFormData({
                username: profile.username || '',
                phone: profile.phone || '',
                gender: profile.gender || '',
                birthdate: profile.birthdate || '',
                currentPassword: '',
                newPassword: '',
            })
        }
    }, [isOpen, profile, user])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        if (file.size > 2 * 1024 * 1024) {
            showToast('Foto deve ter no máximo 2MB', 'error')
            return
        }

        setUploadingAvatar(true)

        try {
            // Preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload
            const { url, error: uploadError } = await uploadAvatar(file, user.id)

            if (uploadError) {
                showToast('Erro ao enviar: ' + uploadError.message, 'error')
                return
            }

            if (url) {
                await updateProfile({ avatar_url: url })
                await refreshProfile()
                showToast('Foto atualizada com sucesso!', 'success')
            }
        } catch (err) {
            showToast('Erro desconhecido ao enviar foto', 'error')
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Tempo limite excedido. Tente novamente.')), 10000)
            )

            const updatePromise = updateProfile({
                username: formData.username,
                phone: formData.phone,
                gender: formData.gender as any,
                birthdate: formData.birthdate || null,
            })

            const { error: updateError } = await Promise.race([updatePromise, timeoutPromise]) as any

            if (updateError) {
                showToast('Erro ao salvar: ' + updateError.message, 'error')
            } else {
                refreshProfile().catch(console.error)
                showToast(`Perfil de ${formData.username} atualizado!`, 'success')
            }
        } catch (err: any) {
            console.error(err)
            showToast(err.message || 'Erro ao salvar alterações', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

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
