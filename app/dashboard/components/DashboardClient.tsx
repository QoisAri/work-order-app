// app/dashboard/components/DashboardClient.tsx
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar'; // Kita akan perbarui Sidebar ini selanjutnya
import type { User } from '@supabase/supabase-js';

// Definisikan tipe data agar sesuai dengan yang dikirim dari layout
type Equipment = {
  id: string;
  nama_equipment: string;
};

type Profile = {
  is_profile_complete: boolean | null;
  role: string | null;
} | null;

type DashboardClientProps = {
  user: User | null;
  equipments: Equipment[];
  profile: Profile;
  children: React.ReactNode;
};

export default function DashboardClient({ user, equipments, profile, children }: DashboardClientProps) {
  const pathname = usePathname();

  // Logika untuk mendeteksi halaman form equipment dipindahkan ke sini
const showEquipmentMenu = pathname.split('/').length > 2 && 
                          pathname !== '/dashboard/create' &&
                          !pathname.startsWith('/dashboard/admin'); // Tambahkan path lain jika perlu

  return (
    <div className="flex min-h-screen">
      <Sidebar 
  user={user} 
  equipments={equipments} 
  showEquipmentMenu={showEquipmentMenu} 
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
