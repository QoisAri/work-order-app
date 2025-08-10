'use client';

import { useState } from 'react';
import Sidebar from "./sidebar"; // Pastikan path ini benar
import MenuButton from './MenuButton'; // Pastikan path ini benar
import type { User } from '@supabase/supabase-js';

// Definisikan tipe untuk data yang akan diterima dari server
type Equipment = {
  id: string;
  nama_equipment: string;
};

type DashboardClientProps = {
  children: React.ReactNode;
  user: User | null;
  equipments: Equipment[];
};

export default function DashboardClient({ children, user, equipments }: DashboardClientProps) {
  // State untuk mengelola sidebar dipindahkan ke sini
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20 w-64`}
      >
        {/* Sidebar menerima data user dan equipments sebagai props */}
        <Sidebar closeSidebar={closeSidebar} user={user} equipments={equipments} />
      </div>

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        {children}
      </main>
    </div>
  );
}