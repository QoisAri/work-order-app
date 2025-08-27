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
    return { error: 'Sesi tidak ditemukan. Silakan login kembali.' };
  }

  // 1. Ambil workOrderId dari form data
  const workOrderId = formData.get('workOrderId') as string;
  if (!workOrderId) {
    return { error: 'ID Work Order tidak ditemukan di dalam form data.' };
  }

  try {
    // 2. Proses semua data form secara manual di server
    const lokasiPekerjaan = formData.getAll('lokasi');
    const lokasiLain = formData.get('lokasi_lain');
    if (lokasiLain && typeof lokasiLain === 'string' && lokasiLain.trim() !== '') {
        lokasiPekerjaan.push(`Yang lain: ${lokasiLain}`);
    }

    const jenisKerusakan = formData.getAll('jenis_kerusakan');
    const kerusakanLain = formData.get('kerusakan_lain');
    if (kerusakanLain && typeof kerusakanLain === 'string' && kerusakanLain.trim() !== '') {
        jenisKerusakan.push(`Yang lain: ${kerusakanLain}`);
    }

    // 3. Buat objek 'details' untuk disimpan ke database
    const detailsPayload = {
      lokasi: lokasiPekerjaan,
      no_compressor: formData.get('no_compressor'),
      jenis_kerusakan: jenisKerusakan,
      running_hours: formData.get('running_hours'),
      deskripsi: formData.get('deskripsi'),
      estimasi_pengerjaan: formData.get('estimasi_pengerjaan'),
      estimasi_selesai: formData.get('estimasi_selesai'),
    };

    // 4. Ganti .insert() menjadi .update() dengan verifikasi
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

    // 5. Verifikasi apakah update berhasil
    if (!data || data.length === 0) {
        console.error('Update GAGAL karena tidak ada baris yang cocok untuk ID:', workOrderId, 'dan User ID:', user.id);
        throw new Error('Gagal memperbarui: Work order tidak ditemukan atau Anda tidak memiliki izin untuk mengubahnya.');
    }

    // Kirim notifikasi
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
