// app/dashboard/components/Sidebar.tsx
'use client';

import Link from 'next/link';
// --- PERBAIKAN: Mengarahkan path import ke folder yang benar ---
import { LogoutButton } from '@/app/components/LogoutButton';
import type { User } from '@supabase/supabase-js';

// Tipe data yang diterima sebagai props
type Equipment = {
  id: string;
  nama_equipment: string;
};

type SidebarProps = {
  user: User | null;
  equipments: Equipment[];
  showEquipmentMenu: boolean; // Prop untuk mengontrol menu
};

export default function Sidebar({ user, equipments, showEquipmentMenu }: SidebarProps) {
  const userEmail = user?.email || null;

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 flex-shrink-0">
      <div className="text-2xl font-bold mb-8">WO System</div>
      
      {userEmail && (
        <div className="mb-6">
          <p className="text-sm text-gray-400">Login sebagai:</p>
          <p className="font-semibold break-words">{userEmail}</p>
        </div>
      )}

      {/* --- Menu equipment sekarang ditampilkan berdasarkan prop --- */}
      {showEquipmentMenu && (
        <nav className="flex-grow">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Pilih Equipment
          </h2>
          <ul>
            {equipments.map((eq) => {
              const equipmentPath = eq.nama_equipment.toLowerCase().replace(/\s+/g, '-');
              return (
                <li key={eq.id} className="mb-2">
                  <Link href={`/dashboard/${equipmentPath}`} className="block py-2 px-3 rounded hover:bg-gray-700 transition-colors duration-200">
                    {eq.nama_equipment}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Spacer agar tombol di bawah tetap di bawah */}
      {!showEquipmentMenu && <div className="flex-grow"></div>}

      <div className="mt-auto">
        {/* --- PERBAIKAN: Mengubah href ke path yang benar --- */}
        <Link href="/submit-work-order" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-4">
            Buat Work Order Baru
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
