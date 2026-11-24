/**
 * ShopEasy — Cloudinary Mobile Upload Service
 *
 * Provides utilities for uploading images from the device gallery or camera
 * directly to Cloudinary or via the backend /api/upload endpoint.
 */

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  public_id?: string;
  error?: string;
}

// Configurable via EXPO_PUBLIC_ environment variables in .env
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'mbeaitwj';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'shopeasy_preset';
const BACKEND_API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://shopeasy-sepia.vercel.app/api').replace(/\/$/, '');

export const CloudinaryMobileService = {
  /**
   * Upload an image file (local file URI from expo-image-picker) directly to Cloudinary
   */
  async uploadImage(
    fileUri: string,
    folder: string = 'shopeasy/mobile'
  ): Promise<CloudinaryUploadResponse> {
    try {
      // 1. If backend API is available, upload through the secure backend route
      try {
        const formData = new FormData();
        const filename = fileUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: fileUri,
          name: filename,
          type,
        } as any);
        formData.append('folder', folder);

        const res = await fetch(`${BACKEND_API_URL}/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            return {
              success: true,
              url: json.url,
              public_id: json.public_id,
            };
          }
        }
      } catch (backendErr) {
        console.log('Backend upload skipped, attempting direct Cloudinary upload:', backendErr);
      }

      // 2. Direct Unsigned Upload to Cloudinary using upload preset
      const data = new FormData();
      const filename = fileUri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      data.append('file', {
        uri: fileUri,
        name: filename,
        type,
      } as any);
      data.append('upload_preset', UPLOAD_PRESET);
      data.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: data,
        }
      );

      const result = await response.json();

      if (result.secure_url) {
        return {
          success: true,
          url: result.secure_url,
          public_id: result.public_id,
        };
      }

      return {
        success: false,
        url: fileUri, // Fallback to local URI
        error: result.error?.message || 'Upload failed',
      };
    } catch (err: any) {
      console.warn('Cloudinary upload error:', err.message);
      return {
        success: false,
        url: fileUri,
        error: err.message,
      };
    }
  },
};

export default CloudinaryMobileService;
