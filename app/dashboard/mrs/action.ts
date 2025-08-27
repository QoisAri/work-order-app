// app/dashboard/mrs/action.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createMrsWorkOrder(formData: FormData) {
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
    return { error: 'Sesi tidak ditemukan. Silakan login kembali.' };
  }

  const workOrderId = formData.get('workOrderId') as string;
  if (!workOrderId) {
    return { error: 'ID Work Order tidak ditemukan di dalam form data.' };
  }

  // --- PENAMBAHAN UNTUK DEBUGGING ---
  // Baris ini akan mencetak ID ke log server Anda.
  console.log("Mencoba memperbarui Work Order ID:", workOrderId);
  console.log("Untuk User ID:", user.id);
  // --- AKHIR PENAMBAHAN ---

  try {
    // Logika penggabungan kerusakan
    const kerusakanEquipment = formData.getAll('kerusakan_equipment');
    const kerusakanLain = formData.get('kerusakan_lain');
    if (kerusakanLain && typeof kerusakanLain === 'string' && kerusakanLain.trim() !== '') {
        kerusakanEquipment.push(`Yang lain: ${kerusakanLain}`);
    }

    // Buat objek 'details' dengan data yang sudah bersih
    const detailsPayload = {
      nomor_mrs: formData.get('nomor_mrs'),
      lokasi_mrs: formData.get('lokasi_mrs'),
      kerusakan_equipment: kerusakanEquipment,
      deskripsi_maintenance: formData.get('deskripsi_maintenance'),
      estimasi_pengerjaan: formData.get('estimasi_pengerjaan'),
      estimasi_selesai: formData.get('estimasi_selesai'),
    };

    const { data, error } = await supabase
      .from('work_orders')
      .update({
        details: detailsPayload,
      })
      .eq('id', workOrderId)
      .eq('user_id', user.id)
      .select('id');

    if (error) {
      console.error('Supabase Update Error:', error);
      throw new Error(`Gagal memperbarui work order: ${error.message}`);
    }

    // Verifikasi apakah update benar-benar terjadi
    if (!data || data.length === 0) {
        console.error('Update GAGAL karena tidak ada baris yang cocok untuk ID:', workOrderId, 'dan User ID:', user.id);
        throw new Error('Gagal memperbarui: Work order tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.');
    }

    // Panggil API Notifikasi Admin
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId: workOrderId }),
      });
    } catch (notificationError) {
      console.error("Gagal memicu notifikasi email admin:", notificationError);
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath(`/dashboard/history/${workOrderId}`);
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}
