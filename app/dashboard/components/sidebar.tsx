'use client';

import Link from "next/link";
import { LogoutButton } from '@/app/components/LogoutButton';
import type { User } from '@supabase/supabase-js';

// Definisikan tipe data yang diterima dari props
type Equipment = {
  id: string;
  nama_equipment: string;
};
type Profile = {
  is_profile_complete: boolean;
  role: string;
} | null;

type SidebarProps = {
  closeSidebar?: () => void;
  user: User | null;
  equipments: Equipment[];
  profile: Profile; // Tambahkan prop untuk profil
};

export default function Sidebar({ closeSidebar, user, equipments, profile }: SidebarProps) {
  const isGuest = !user;
  // Tentukan status kelengkapan profil dari props
  const isProfileComplete = profile?.is_profile_complete || false;

  const handleLinkClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 text-white flex flex-col h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">WO System</h1>
      
      {isGuest ? (
        <div className="text-center bg-gray-700 p-4 rounded-md">
          <Link href="/login" onClick={handleLinkClick} className="font-bold text-indigo-400 hover:text-indigo-300">
            Login untuk Melanjutkan
          </Link>
        </div>
      ) : (
        <>
          <div className='mb-4 p-2 bg-gray-900 rounded-md'>
            <p className='text-xs text-gray-400'>Login sebagai:</p>
            <p className='text-sm font-medium truncate' title={user.email || ''}>{user.email}</p>
          </div>

          <nav className="flex-grow">
            <h2 className="text-xs font-semibold uppercase text-gray-400 mb-2">Pilih Equipment</h2>
            
            {/* LOGIKA KONDISIONAL BARU */}
            {!isProfileComplete ? (
              // Tampilan jika profil belum lengkap
              <div className="p-2 text-sm text-gray-400 bg-gray-700 rounded-md">
                Menu terkunci. Silakan <Link href="/submit-work-order" onClick={handleLinkClick} className="font-bold text-indigo-400 hover:underline">buat Work Order</Link> pertama untuk membuka.
              </div>
            ) : (
              // Tampilan jika profil sudah lengkap
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
            )}
          </nav>
          
          {/* Tombol "Buat Work Order" & Logout di bawah */}
          <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
            <Link 
              href="/submit-work-order"
              onClick={handleLinkClick}
              className="block w-full text-center py-2 px-4 rounded-md no-underline bg-indigo-600 hover:bg-indigo-700 font-semibold"
            >
              Buat Work Order Baru
            </Link>
            <LogoutButton />
          </div>
        </>
      )}
    </aside>
  );
}