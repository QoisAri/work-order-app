// app/dashboard/components/DashboardClient.tsx
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import type { User } from '@supabase/supabase-js';

// Tipe data (pastikan sama dengan yang sebelumnya)
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
  
  // Logika Anda untuk menampilkan menu equipment (sudah benar)
  const showEquipmentMenu = pathname.startsWith('/dashboard/') && 
                            pathname !== '/dashboard/history' && 
                            pathname !== '/dashboard/create';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar 
        user={user} 
        equipments={equipments} 
        showEquipmentMenu={showEquipmentMenu} 
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}