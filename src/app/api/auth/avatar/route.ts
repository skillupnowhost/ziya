import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

async function saveLocalAvatar(file: File, userId: string): Promise<string> {
  const { default: path } = await import('path');
  const { default: fs } = await import('fs/promises');
  const { existsSync } = await import('fs');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  if (!existsSync(uploadDir)) await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const filename = `${userId}-${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));
  return `/uploads/avatars/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const avatarUrl = await saveLocalAvatar(file, payload.id as string);

    const { data: row, error } = await supabase
      .from('users')
      .update({ avatar: avatarUrl })
      .eq('id', payload.id as string)
      .select('id, name, email, role, phone, avatar, addresses, default_address, created_at, updated_at')
      .single();

    if (error || !row) {
      return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
    }

    return NextResponse.json({ user: mapRow(row) });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: row, error } = await supabase
      .from('users')
      .update({ avatar: null })
      .eq('id', payload.id as string)
      .select('id, name, email, role, phone, avatar, addresses, default_address, created_at, updated_at')
      .single();

    if (error || !row) {
      return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
    }

    return NextResponse.json({ user: mapRow(row) });
  } catch (err) {
    console.error('Avatar delete error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
