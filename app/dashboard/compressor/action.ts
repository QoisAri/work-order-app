// app/dashboard/compressor/action.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createCompressorWorkOrder(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // --- PERBAIKAN: Menggunakan getUser() untuk validasi sesi ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sesi tidak ditemukan atau tidak valid. Silakan login kembali.' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  try {
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        // --- PERBAIKAN: Menggunakan user.id dari getUser() ---
        user_id: user.id,
        equipment_id: rawFormData.equipmentId as string,
        status: 'pending',
        details: rawFormData,
      })
      .select();

    if (error) {
      // Log error yang lebih detail di server untuk debugging
      console.error('Supabase insert error:', error);
      throw new Error(error.message);
    }

    revalidatePath('/dashboard', 'layout');
    return { success: true, data };

  } catch (error: any) {
    return { error: error.message };
  }
}
