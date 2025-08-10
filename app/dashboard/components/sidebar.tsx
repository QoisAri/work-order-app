'use client';

import Link from "next/link";
import { LogoutButton } from '@/app/components/LogoutButton';
import type { User } from '@supabase/supabase-js'; // Impor tipe User untuk TypeScript

// Definisikan tipe untuk data equipment
type Equipment = {
  id: string;
  nama_equipment: string;
};

// Perbarui SidebarProps untuk menerima 'user' dan 'equipments' dari server
type SidebarProps = {
  closeSidebar?: () => void; // Fungsi opsional untuk mobile
  user: User | null;
  equipments: Equipment[];
};

export default function Sidebar({ closeSidebar, user, equipments }: SidebarProps) {
  // Status login sekarang ditentukan langsung dari prop 'user'.
  const isGuest = !user;

  const handleLinkClick = () => {
    // Fungsi ini tetap berguna untuk menutup sidebar di tampilan mobile
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 text-white flex flex-col h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">WO System</h1>
      
      {isGuest ? (
        // Tampilan untuk Tamu (Guest)
        <div className="text-center bg-gray-700 p-4 rounded-md">
          <p className="mb-2">Harap login untuk membuat work order.</p>
          <Link 
            href="/login" 
            onClick={handleLinkClick} 
            className="font-bold text-indigo-400 hover:text-indigo-300"
          >
            Pergi ke Halaman Login &rarr;
          </Link>
        </div>
      ) : (
        // Tampilan untuk Pengguna yang Sudah Login
        <>
          {/* Menampilkan informasi user */}
          <div className='mb-4 p-2 bg-gray-900 rounded-md'>
            <p className='text-xs text-gray-400'>Login sebagai:</p>
            <p className='text-sm font-medium truncate' title={user.email || ''}>
              {user.email}
            </p>
          </div>

          {/* Navigasi utama */}
          <nav className="flex-grow">
            <h2 className="text-xs font-semibold uppercase text-gray-400 mb-2">Pilih Equipment</h2>
            <ul>
              {equipments.map(eq => (
                <li key={eq.id}>
                  <Link 
                    href={`/dashboard/create/${eq.id}`} 
                    onClick={handleLinkClick}
                    className="block py-2 px-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    {eq.nama_equipment}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tombol Logout di bagian bawah */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <LogoutButton />
          </div>
        </>
      )}
    </aside>
  );
}