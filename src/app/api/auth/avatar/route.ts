import { NextRequest, NextResponse } from 'next/server';
import { supabase, mapRow } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

const BUCKET = 'products';

async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${userId}-${Date.now()}.${ext}`;
  const filePath = `avatars/${filename}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
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

    const avatarUrl = await uploadAvatar(file, payload.id as string);

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
