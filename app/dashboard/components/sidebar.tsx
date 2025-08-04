'use client';

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";

// Definisikan tipe data untuk props, termasuk fungsi untuk menutup sidebar
type SidebarProps = {
  closeSidebar?: () => void; // Fungsi ini opsional
};

type Equipment = {
  id: string;
  nama_equipment: string;
};

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const [isGuest, setIsGuest] = useState(true);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userInfo = sessionStorage.getItem('workOrderUserInfo');
    setIsGuest(!userInfo);

    const fetchEquipments = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('equipments').select('*').order('nama_equipment', { ascending: true });
      setEquipments(data || []);
      setIsLoading(false);
    };
    
    if (!userInfo) {
      setIsLoading(false);
      return;
    }

    fetchEquipments();
  }, []);

  const handleLinkClick = () => {
    // Jika fungsi closeSidebar diberikan (hanya terjadi di mobile), jalankan
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    // Tambahkan kelas h-full dan overflow-y-auto untuk memastikan sidebar bisa di-scroll penuh
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 text-white flex flex-col h-full overflow-y-auto">
      <h1 className="text-xl font-bold mb-6">WO System</h1>
      
      {isGuest ? (
        <div className="text-center bg-gray-700 p-4 rounded-md">
          <p>Anda adalah Tamu.</p>
          <Link href="/" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300">
            &larr; Kembali
          </Link>
        </div>
      ) : (
        <nav className="flex-grow">
          <h2 className="text-xs font-semibold uppercase text-gray-400 mb-2">Pilih Equipment</h2>
          {isLoading ? (
            <p className="text-gray-400">Memuat...</p>
          ) : (
            <ul>
              {equipments.map(eq => (
                <li key={eq.id}>
                  {/* --- PERUBAHAN DI SINI --- */}
                  <Link 
                    href={`/dashboard/create/${eq.id}`} 
                    onClick={handleLinkClick} // Tambahkan onClick di sini
                    className="block py-2 px-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    {eq.nama_equipment}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      )}
    </aside>
  );
}