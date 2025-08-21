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
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Jika ada error dari Supabase, kembalikan dalam format yang benar
      return { error: error.message };
    }

    if (data) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workOrderId: data.id }),
        });
      } catch (notificationError) {
        console.error("Gagal memicu notifikasi email admin:", notificationError);
      }
    }

    revalidatePath('/dashboard', 'layout');
    // PERBAIKAN UTAMA: Kembalikan objek dengan error: null saat berhasil
    return { error: null };

  } catch (error: any) {
    return { error: error.message };
  }
}