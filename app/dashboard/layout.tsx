'use client';

import { useState } from 'react';
import Sidebar from "./components/sidebar";
import MenuButton from './components/MenuButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    // PERBAIKAN DI SINI: ganti 'min-h-screen' menjadi 'h-screen' dan tambahkan 'overflow-hidden'
    <div className="relative flex h-screen bg-gray-100 overflow-hidden">
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
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        {children}
      </main>
    </div>
  );
}