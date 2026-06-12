import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

async function saveLocalFile(file: File, subfolder: string): Promise<string> {
  const { default: path } = await import('path');
  const { default: fs } = await import('fs/promises');
  const { existsSync } = await import('fs');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
  if (!existsSync(uploadDir)) await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || '.bin';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));
  return `/uploads/${subfolder}/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only images and videos are allowed' }, { status: 400 });
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${isVideo ? '50MB' : '5MB'}.` },
        { status: 400 },
      );
    }

    let url: string;

    if (cloudinaryConfigured) {
      const { uploadMedia } = await import('@/lib/cloudinary');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      url = await uploadMedia(buffer, 'ziya/reviews', isVideo ? 'video' : 'image');
    } else {
      url = await saveLocalFile(file, isVideo ? 'review-videos' : 'review-images');
    }

    return NextResponse.json({ url, type: isVideo ? 'video' : 'image' });
  } catch (err) {
    console.error('Review media upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
