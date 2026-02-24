// Storage utilities for Cloudflare R2 uploads
// All uploads are now handled via the /api/upload route (server-side)
// This file provides client-side helper functions for upload operations

/**
 * Upload a file to R2 via the API endpoint
 */
export async function uploadFile(file: File): Promise<{ url: string; error?: any }> {
    try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) {
            const data = await res.json()
            return { url: '', error: { message: data.error || 'Upload failed' } }
        }

        const { url } = await res.json()
        return { url }
    } catch (error: any) {
        return { url: '', error: { message: error.message || 'Upload failed' } }
    }
}

/**
 * Upload a listing image with progress simulation
 */
export async function uploadListingImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ url: string; error?: any }> {
    try {
        // Simulate progress since fetch doesn't support real progress tracking
        let progress = 0
        const progressInterval = setInterval(() => {
            progress = Math.min(progress + 10, 90)
            onProgress?.(progress)
        }, 200)

        const result = await uploadFile(file)

        clearInterval(progressInterval)
        onProgress?.(100)

        return result
    } catch (error: any) {
        return { url: '', error: { message: error.message || 'Upload failed' } }
    }
}

/**
 * Upload an avatar image for a user
 */
export async function uploadAvatar(
    file: File,
    userId: string
): Promise<{ url: string; error?: any }> {
    return uploadFile(file)
}
