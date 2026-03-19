// hooks/useCloudinaryUpload.ts
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export interface CloudinaryUploadOptions {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: number;
}

interface UseCloudinaryUploadReturn {
    uploadFile: (file: File) => Promise<string>;
    isUploading: boolean;
    error: string | null;
}

const defaultOptions: CloudinaryUploadOptions = {
    width: 500,
    height: 500,
    crop: 'fill',
    gravity: 'face',
    quality: 100,
};

export function useCloudinaryUpload(options?: CloudinaryUploadOptions): UseCloudinaryUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const opts = { ...defaultOptions, ...options };

    const uploadFile = async (file: File): Promise<string> => {
        setIsUploading(true);
        setError(null);

        try {
            // Convert file to base64 data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Upload via server-side API route (has Cloudinary credentials)
            const response = await fetch('/api/upload-social-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataUrl }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload image');
            }

            // Apply transformations to the URL
            const baseUrl = data.url.split('/upload/')[0] + '/upload/';
            const transformations = `c_${opts.crop},g_${opts.gravity},w_${opts.width},h_${opts.height},q_${opts.quality}/`;
            const filename = data.url.split('/upload/')[1];
            return baseUrl + transformations + filename;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload image';
            setError(message);
            toast.error(message);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading, error };
}
