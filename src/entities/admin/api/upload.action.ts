'use server';

import { supabaseAdmin } from "@/shared/lib/supabase";

export async function uploadImageAction(formData: FormData): Promise<{ publicUrl: string; imagePath: string; error: string | null }> {
  try {
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'Products';
    const folder = formData.get('folder') as string || '';

    if (!file) {
      return { publicUrl: '', imagePath: '', error: 'Файл не предоставлен' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Ensure bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.find((b: { name: string }) => b.name === bucket);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucket} not found, creating it...`);
      await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
      });
    }

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('Supabase upload error:', error);
      return { publicUrl: '', imagePath: '', error: error.message };
    }

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

    return { publicUrl: publicData.publicUrl, imagePath: filePath, error: null };
  } catch (error: unknown) {
    console.error('Server upload exception:', error);
    const errMsg = error instanceof Error ? error.message : 'Внутренняя ошибка сервера при загрузке';
    return { publicUrl: '', imagePath: '', error: errMsg };
  }
}
