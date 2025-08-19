// app/dashboard/components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/app/components/LogoutButton';
import type { User } from '@supabase/supabase-js';

// --- Ikon untuk Tombol Mobile ---
const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Tipe data props (tidak diubah) ---
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
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Logika asli Anda (tidak diubah) ---
  const pathname = usePathname();
  const userEmail = user?.email || null;
  const createUrlPath = (name: string) => {
    let cleanName = name;
    const parenthesisIndex = cleanName.indexOf('(');
    if (parenthesisIndex !== -1) {
      cleanName = cleanName.substring(0, parenthesisIndex).trim();
    }
    return cleanName.toLowerCase().replace(/\s+/g, '-');
  };
  const finalEquipments = showEquipmentMenu
    ? equipments.filter(eq => {
        const equipmentPath = createUrlPath(eq.nama_equipment);
        return pathname.includes(equipmentPath);
      })
    : equipments;

  const SidebarContent = () => (
    <aside className="w-full h-full bg-gray-800 text-white flex flex-col p-4">
      <div className="text-2xl font-bold mb-8">WO System</div>
      
      {userEmail && (
        <div className="mb-6">
          <p className="text-sm text-gray-400">Login sebagai:</p>
          <p className="font-semibold break-words">{userEmail}</p>
        </div>
      )}

      {showEquipmentMenu && (
        <nav className="flex-grow overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Pilih Equipment
          </h2>
          <ul>
            {finalEquipments.map((eq) => {
              const equipmentPath = createUrlPath(eq.nama_equipment);
              const isActive = pathname.includes(equipmentPath);
              return (
                <li key={eq.id} className="mb-2">
                  {/* PERBAIKAN: Tambahkan onClick untuk menutup menu */}
                  <Link 
                    href={`/dashboard/${equipmentPath}`}
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`block py-2 px-3 rounded transition-colors duration-200 ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
                  >
                    {eq.nama_equipment}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {!showEquipmentMenu && (
        <nav className="flex-grow">
          {/* PERBAIKAN: Tambahkan onClick untuk menutup menu */}
          <Link 
            href="/dashboard/history"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 px-3 rounded transition-colors duration-200 mb-2 ${pathname === '/dashboard/history' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
            Riwayat Saya
          </Link>
        </nav>
      )}

      <div className="mt-auto">
        {!showEquipmentMenu && (
            // PERBAIKAN: Tambahkan onClick untuk menutup menu
            <Link 
              href="/submit-work-order"
              onClick={() => setMobileMenuOpen(false)} 
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-4">
                Buat Work Order Baru
            </Link>
        )}
        <LogoutButton />
      </div>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 z-10 md:hidden flex items-center justify-between p-4 bg-white border-b">
        <span className="font-bold text-gray-800">WO System</span>
        <button onClick={() => setMobileMenuOpen(true)}>
          <MenuIcon />
        </button>
      </div>
      <div className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative flex flex-col w-64 h-full bg-gray-800">
          <div className="absolute top-4 right-4">
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <CloseIcon />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <div className="fixed top-0 left-0 h-screen w-64">
           <SidebarContent />
        </div>
      </div>
    </>
  );
}