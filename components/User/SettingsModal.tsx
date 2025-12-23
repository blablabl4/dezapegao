'use client'

import { useState, useEffect } from 'react'
import { getCurrentStoredUser, updateCurrentStoredUser, type StoredUser } from '@/lib/local-storage'

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
    const [user, setUser] = useState<StoredUser | null>(null)
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
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (isOpen) {
            const currentUser = getCurrentStoredUser()
            if (currentUser) {
                setUser(currentUser)
                setAvatarPreview(currentUser.avatar_url || null)
                setFormData({
                    username: currentUser.username || '',
                    email: currentUser.email || '',
                    phone: currentUser.phone || '',
                    gender: currentUser.gender || '',
                    birthdate: currentUser.birthdate || '',
                    currentPassword: '',
                    newPassword: '',
                })
            }
            setMessage('')
        }
    }, [isOpen])

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            setMessage('Foto deve ter no máximo 2MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            setAvatarPreview(base64)
            updateCurrentStoredUser({ avatar_url: base64 })
            setMessage('Foto atualizada!')
        }
        reader.readAsDataURL(file)
    }

    const handleSave = () => {
        setSaving(true)

        updateCurrentStoredUser({
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender as any,
            birthdate: formData.birthdate,
        })

        setTimeout(() => {
            setSaving(false)
            setMessage('Dados salvos!')
        }, 500)
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
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition">
                                <span className="text-white text-sm">📷</span>
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
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

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Telefone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                placeholder="+55 11 99999-9999"
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

                        {/* Password */}
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-white font-semibold mb-4">Trocar senha</h3>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                    placeholder="Senha atual"
                                />
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 transition text-sm"
                                    placeholder="Nova senha"
                                />
                            </div>
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
