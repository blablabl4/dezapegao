'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface UploadResult {
    url: string | null
    error: Error | null
}

// Upload avatar for user
export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    const supabase = createClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    try {
        // Delete old avatar if exists
        await supabase.storage
            .from('avatars')
            .remove([fileName])

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        return { url: publicUrl, error: null }
    } catch (error) {
        return { url: null, error: error as Error }
    }
}

// Upload listing image
export async function uploadListingImage(
    file: File,
    userId: string,
    listingId: string,
    position: number
): Promise<UploadResult> {
    const supabase = createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${listingId}/${position}.${fileExt}`

    try {
        const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(fileName)

        return { url: publicUrl, error: null }
    } catch (error) {
        return { url: null, error: error as Error }
    }
}

// Delete listing images
export async function deleteListingImages(userId: string, listingId: string): Promise<void> {
    const supabase = createClient()

    const { data: files } = await supabase.storage
        .from('listings')
        .list(`${userId}/${listingId}`)

    if (files && files.length > 0) {
        const filesToDelete = files.map(f => `${userId}/${listingId}/${f.name}`)
        await supabase.storage
            .from('listings')
            .remove(filesToDelete)
    }
}

// Hook for file upload with progress
export function useFileUpload() {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<Error | null>(null)

    const uploadFile = async (
        file: File,
        bucket: 'avatars' | 'listings',
        path: string
    ): Promise<string | null> => {
        setUploading(true)
        setProgress(0)
        setError(null)

        try {
            const supabase = createClient()

            // Simulate progress (Supabase doesn't provide real progress)
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90))
            }, 100)

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true,
                })

            clearInterval(progressInterval)

            if (uploadError) throw uploadError

            setProgress(100)

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path)

            return publicUrl
        } catch (err) {
            setError(err as Error)
            return null
        } finally {
            setUploading(false)
        }
    }

    return { uploadFile, uploading, progress, error }
}
