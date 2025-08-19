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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Sesi tidak ditemukan atau tidak valid. Silakan login kembali.' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  try {
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        user_id: user.id,
        equipment_id: rawFormData.equipmentId as string,
        status: 'pending',
        details: rawFormData,
      })
      .select('id') // Hanya perlu ID untuk notifikasi
      .single(); // Mengambil satu baris data

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(error.message);
    }

    // --- PENAMBAHAN: Panggil API Notifikasi Admin ---
    if (data) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workOrderId: data.id }),
        });
      } catch (notificationError) {
        // Jika notifikasi gagal, jangan gagalkan proses utama.
        // Cukup catat error-nya di log server.
        console.error("Gagal memicu notifikasi email admin:", notificationError);
      }
    }
    // --- AKHIR PENAMBAHAN ---

    revalidatePath('/dashboard', 'layout');
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}
