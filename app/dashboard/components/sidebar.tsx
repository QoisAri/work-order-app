// app/dashboard/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const userEmail = user?.email || null;

  // Fungsi untuk membersihkan nama equipment menjadi format URL
  const createUrlPath = (name: string) => {
    let cleanName = name;
    const parenthesisIndex = cleanName.indexOf('(');
    if (parenthesisIndex !== -1) {
      cleanName = cleanName.substring(0, parenthesisIndex).trim();
    }
    return cleanName.toLowerCase().replace(/\s+/g, '-');
  };

  // --- LOGIKA BARU: Filter equipment yang akan ditampilkan ---
  const finalEquipments = showEquipmentMenu
    ? equipments.filter(eq => {
        const equipmentPath = createUrlPath(eq.nama_equipment);
        // Tampilkan hanya jika path URL saat ini mengandung path equipment tersebut
        return pathname.includes(equipmentPath);
      })
    : equipments;


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
            {finalEquipments.map((eq) => {
              const equipmentPath = createUrlPath(eq.nama_equipment);
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
