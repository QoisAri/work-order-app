import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

// Komponen untuk menyambut pengguna baru
function WelcomeDashboard() {
  return (
    <div className="text-center bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang di WO System!</h1>
      <p className="text-gray-600 mb-6">
        Profil Anda belum lengkap. Silakan buat Work Order pertama Anda untuk mulai menggunakan aplikasi.
      </p>
      <Link 
        href="/submit-work-order" 
        className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Lengkapi Profil & Buat Work Order
      </Link>
    </div>
  );
}

// Komponen untuk dasbor utama jika profil sudah lengkap
function MainDashboard() {
  // TODO: Di sini Anda bisa menampilkan daftar work order, statistik, dll.
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">Dasbor Utama</h1>
      <p className="mt-4 text-gray-600">Profil Anda sudah lengkap. Anda sekarang bisa menggunakan semua fitur.</p>
      {/* Contoh: <WorkOrderList /> */}
    </div>
  );
}

export default async function DashboardPage() {
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
    // Seharusnya tidak akan pernah terjadi karena ada middleware, tapi sebagai pengaman
    return <p>Silakan login kembali.</p>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_profile_complete')
    .eq('id', user.id)
    .single();

  // Tampilkan komponen yang sesuai berdasarkan status profil
  if (!profile || !profile.is_profile_complete) {
    return <WelcomeDashboard />;
  } else {
    return <MainDashboard />;
  }
}