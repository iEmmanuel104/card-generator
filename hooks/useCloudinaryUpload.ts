// hooks/useCloudinaryUpload.ts
import { useState } from 'react';
import { toast } from 'sonner';

interface UseCloudinaryUploadReturn {
    uploadFile: (file: File) => Promise<string>;
    isUploading: boolean;
    error: string | null;
}

export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File): Promise<string> => {
        setIsUploading(true);
        setError(null);

        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
            throw new Error('Cloudinary configuration is missing');
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload image');
            }

            // Apply transformations to the URL
            const baseUrl = data.secure_url.split('/upload/')[0] + '/upload/';
            const transformations = 'c_fill,g_face,w_398,h_488,q_100/';
            const filename = data.secure_url.split('/upload/')[1];
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