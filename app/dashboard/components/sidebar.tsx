// app/dashboard/components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/app/components/LogoutButton';
import type { User } from '@supabase/supabase-js';

// --- Komponen Ikon Sederhana (ditempatkan di sini agar mandiri) ---
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

// --- Tipe data props (sama seperti milik Anda) ---
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
  // State untuk mengontrol menu mobile
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const userEmail = user?.email || null;

  // --- Logika dari kode Anda (sudah bagus, kita pertahankan) ---
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

  // --- Konten Sidebar (dipisahkan agar bisa dipakai ulang) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8 flex-shrink-0">WO System</div>
      
      {userEmail && (
        <div className="mb-6 flex-shrink-0">
          <p className="text-sm text-gray-400">Login sebagai:</p>
          <p className="font-semibold break-words">{userEmail}</p>
        </div>
      )}

      <nav className="flex-grow overflow-y-auto">
        {!showEquipmentMenu && (
          <>
            <Link 
              href="/dashboard/history" 
              className={`block py-2 px-3 rounded transition-colors duration-200 mb-2 ${pathname === '/dashboard/history' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Riwayat Saya
            </Link>
            <Link href="/dashboard/create" 
              className={`block py-2 px-3 rounded transition-colors duration-200 ${pathname === '/dashboard/create' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Buat Work Order Baru
            </Link>
          </>
        )}
        
        {showEquipmentMenu && (
          <>
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
                      className={`block py-2 px-3 rounded transition-colors duration-200 ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
                      {eq.nama_equipment}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      <div className="mt-auto flex-shrink-0">
        <LogoutButton />
      </div>
    </div>
  );
  
  return (
    <>
      {/* Tombol Hamburger & Header untuk Mobile (hanya muncul di layar kecil) */}
      <div className="sticky top-0 z-10 md:hidden flex items-center justify-between p-4 bg-white border-b">
        <span className="font-bold text-gray-800">WO System</span>
        <button onClick={() => setMobileMenuOpen(true)}>
          <MenuIcon />
        </button>
      </div>

      {/* Sidebar untuk Mobile (Overlay) */}
      <div className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative w-64 h-full bg-gray-800">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 text-white">
            <CloseIcon />
          </button>
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar untuk Desktop (Statis) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:h-screen md:sticky md:top-0">
        <SidebarContent />
      </aside>
    </>
  );
}