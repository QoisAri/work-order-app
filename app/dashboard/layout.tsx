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

  // Fungsi untuk menutup sidebar, akan kita teruskan ke komponen Sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
          onClick={closeSidebar} // Tutup juga saat overlay diklik
        ></div>
      )}

      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-20 w-64 h-full`}
      >
        {/* Teruskan fungsi closeSidebar sebagai prop */}
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <MenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        {children}
      </main>
    </div>
  );
}