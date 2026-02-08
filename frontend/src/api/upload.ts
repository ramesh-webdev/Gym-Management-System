import { api } from './client';

export interface UploadResponse {
    url: string;
    public_id: string;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image size must be less than 2MB');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const data = await api.postFormData<UploadResponse>('/products/upload', formData);
        return data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error instanceof Error ? error : new Error('An unknown error occurred during upload');
    }
}
