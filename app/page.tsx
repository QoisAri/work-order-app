import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Jika sudah login, middleware akan mengarahkan ke halaman yang benar (admin/dashboard)
    // Tampilkan tombol dashboard/admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const userRole = profile?.role;

    if (userRole === 'admin' || userRole === 'engineer') {
        redirect('/admin');
    } else {
        redirect('/dashboard');
    }
  }

  // Jika belum login, tampilkan halaman landing
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Selamat Datang di Sistem Work Order</h1>
            <p className="mb-8 text-lg text-gray-600">Silakan login untuk membuat atau mengelola work order.</p>
            <Link href="/login" className="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500">
                Login
            </Link>
        </div>
    </main>
  );
}