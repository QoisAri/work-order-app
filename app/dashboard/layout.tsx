'use client'; // Ubah menjadi Client Component untuk mengelola state

import { useState } from 'react';
import Sidebar from "./components/sidebar";
import MenuButton from './components/MenuButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      {/* Overlay untuk menggelapkan konten saat sidebar terbuka di mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20`}
      >
        <Sidebar />
      </div>

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Tombol Menu hanya muncul di mobile */}
        <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        {children}
      </main>
    </div>
  );
}