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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: 'Sesi tidak ditemukan. Silakan login kembali.' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  try {
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        user_id: session.user.id,
        equipment_id: rawFormData.equipmentId,
        status: 'pending',
        details: rawFormData,
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/dashboard', 'layout');
    return { success: true, data };

  } catch (error: any) {
    return { error: error.message };
  }
}
