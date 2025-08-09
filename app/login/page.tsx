'use client';

import { createClient } from '@/utils/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      // Setelah login/register berhasil, refresh halaman
      // Middleware akan mengarahkan ke halaman yang benar
      router.refresh();
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          // PERBAIKAN DI SINI: Ganti window.location.origin
          redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
        />
      </div>
    </main>
  );
}