// app/dashboard/components/DashboardClient.tsx
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar'; // Pastikan nama file 'Sidebar.tsx'
import type { User } from '@supabase/supabase-js';

// Tipe data (tidak diubah)
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
  // Logika asli Anda tetap dipertahankan
  const pathname = usePathname();
  const showEquipmentMenu = pathname.split('/').length > 2 && 
                            pathname !== '/submit-work-order' &&
                            pathname !== '/dashboard/history' && // Tambahkan history agar tidak trigger
                            !pathname.startsWith('/dashboard/admin');

  return (
    // Layout utama diubah untuk mengakomodasi sidebar desktop
    <div className="relative min-h-screen md:flex">
      <Sidebar 
        user={user} 
        equipments={equipments} 
        showEquipmentMenu={showEquipmentMenu} 
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/80">
        {children}
      </main>
    </div>
  );
}