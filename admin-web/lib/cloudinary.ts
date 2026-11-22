import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    CLOUD_NAME &&
    API_KEY &&
    API_SECRET &&
    !CLOUD_NAME.includes('YOUR_') &&
    !API_KEY.includes('YOUR_')
  );
}

// Initialize Cloudinary
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: object[];
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads an image (Buffer, base64 data URI, or remote URL) to Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.');
  }

  const folder = options.folder || 'shopeasy/products';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options.publicId,
        tags: options.tags || ['shopeasy'],
        transformation: options.transformation || [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned empty response'));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else if (typeof file === 'string') {
      if (file.startsWith('data:') || file.startsWith('http://') || file.startsWith('https://')) {
        cloudinary.uploader
          .upload(file, {
            folder,
            public_id: options.publicId,
            tags: options.tags || ['shopeasy'],
          })
          .then((res) => {
            resolve({
              url: res.url,
              secure_url: res.secure_url,
              public_id: res.public_id,
              format: res.format,
              width: res.width,
              height: res.height,
              bytes: res.bytes,
            });
          })
          .catch(reject);
      } else {
        uploadStream.end(Buffer.from(file, 'base64'));
      }
    } else {
      reject(new Error('Invalid file format provided for Cloudinary upload.'));
    }
  });
}

/**
 * Delete asset from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) {
    return false;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (err) {
    console.error('Error deleting asset from Cloudinary:', err);
    return false;
  }
}

/**
 * Generate a signed timestamp signature for direct client uploads from Mobile (Expo) or Browser
 */
export function generateClientUploadSignature(folder: string = 'shopeasy/uploads') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    API_SECRET
  );

  return {
    timestamp,
    signature,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder,
  };
}

export default cloudinary;
