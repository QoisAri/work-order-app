'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function updateUserProfile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Akses ditolak, pengguna tidak ditemukan.' };
  }

  const fullName = formData.get('full_name') as string;
  const noWa = formData.get('no_wa') as string;
  const subDepart = formData.get('sub_depart') as string;

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      no_wa: noWa,
      sub_depart: subDepart,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Update Profile Error:', error);
    return { error: 'Gagal menyimpan data profil.' };
  }

  return { success: true };
}