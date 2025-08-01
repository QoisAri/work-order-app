'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUserInfo = sessionStorage.getItem('workOrderUserInfo');
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setUserName(userInfo.nama);
    }
  }, []);

  if (userName === null) {
     return (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
            <p className="mt-2 text-gray-600">
                Anda harus mengisi data awal untuk mengakses halaman ini.
            </p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
                Kembali ke Halaman Awal
            </Link>
        </div>
     )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="mt-2 text-lg text-gray-600">
        Selamat datang, <strong>{userName}</strong>! 
      </p>
      <p className="mt-4">
        Silakan lanjutkan proses pembuatan Work Order Anda.
      </p>
    </div>
  );
}
