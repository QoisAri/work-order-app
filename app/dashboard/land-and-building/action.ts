'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createLandBuildingWorkOrder(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Sesi tidak ditemukan. Silakan login kembali.' };
    }

    const equipmentId = formData.get('equipmentId') as string;
    let jobTypeId = formData.get('job_type_id') as string | null;

    // Pengaman: Jika jobTypeId adalah string kosong, ubah menjadi null
    if (jobTypeId === '') {
      jobTypeId = null;
    }

    // Gabungkan 'maintenance_lain' jika ada
    const maintenanceLainValue = formData.get('maintenance_lain');
    if (maintenanceLainValue) {
        formData.append('equipment_maintenance', `Yang lain: ${maintenanceLainValue}`);
    }
    formData.delete('maintenance_lain');
    
    const details = Object.fromEntries(formData.entries());

    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        user_id: user.id,
        equipment_id: equipmentId,
        job_type_id: jobTypeId,
        status: 'pending',
        details: details,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workOrderId: data.id }),
        });
      } catch (notificationError) {
        console.error("Gagal memicu notifikasi:", notificationError);
      }
    }

    revalidatePath('/dashboard', 'layout');
    return { success: true };

  } catch (error: any) {
    return { error: error.message };
  }
}