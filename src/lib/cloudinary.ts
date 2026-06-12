import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(buffer: Buffer, folder: string = 'ziya'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadMedia(
  buffer: Buffer,
  folder: string = 'ziya',
  resourceType: 'image' | 'video' | 'raw' = 'image',
): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: Record<string, any> = { folder, resource_type: resourceType };
    if (resourceType === 'image') {
      opts.quality = 'auto';
      opts.fetch_format = 'auto';
    }
    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) reject(error);
      else resolve(result!.secure_url);
    });
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
