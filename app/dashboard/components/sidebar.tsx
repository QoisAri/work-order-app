// app/dashboard/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { LogoutButton } from '@/app/components/LogoutButton';
import type { User } from '@supabase/supabase-js';

type Equipment = {
  id: string;
  nama_equipment: string;
};

type SidebarProps = {
  user: User | null;
  equipments: Equipment[];
  showEquipmentMenu: boolean;
};

export default function Sidebar({ user, equipments, showEquipmentMenu }: SidebarProps) {
  const pathname = usePathname(); // Dapatkan path URL saat ini
  const userEmail = user?.email || null;

  // --- LOGIKA BARU: Filter equipment yang akan ditampilkan ---
  const displayedEquipments = showEquipmentMenu 
    ? equipments.filter(eq => {
        // Ubah nama equipment menjadi format URL (e.g., "Land and Building" -> "land-and-building")
        const equipmentPath = eq.nama_equipment.toLowerCase().replace(/\s+/g, '-');
        // Tampilkan hanya jika path URL saat ini mengandung path equipment tersebut
        return pathname.includes(equipmentPath);
      })
    : [];

  // Jika tidak ada equipment yang cocok (misal di halaman utama), tampilkan semua
  const finalEquipments = displayedEquipments.length > 0 ? displayedEquipments : equipments;


  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 flex-shrink-0">
      <div className="text-2xl font-bold mb-8">WO System</div>
      
      {userEmail && (
        <div className="mb-6">
          <p className="text-sm text-gray-400">Login sebagai:</p>
          <p className="font-semibold break-words">{userEmail}</p>
        </div>
      )}

      {/* Tampilkan menu hanya jika showEquipmentMenu adalah true */}
      {showEquipmentMenu && (
        <nav className="flex-grow">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Pilih Equipment
          </h2>
          <ul>
            {/* --- PERUBAHAN: Gunakan daftar equipment yang sudah difilter --- */}
            {finalEquipments.map((eq) => {
              const equipmentPath = eq.nama_equipment.toLowerCase().replace(/\s+/g, '-');
              // Tambahkan style untuk menandai item yang aktif
              const isActive = pathname.includes(equipmentPath);
              return (
                <li key={eq.id} className="mb-2">
                  <Link 
                    href={`/dashboard/${equipmentPath}`} 
                    className={`block py-2 px-3 rounded transition-colors duration-200 ${
                      isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'
                    }`}
                  >
                    {eq.nama_equipment}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {!showEquipmentMenu && <div className="flex-grow"></div>}

      <div className="mt-auto">
        <Link href="/submit-work-order" className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-4">
            Buat Work Order Baru
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
