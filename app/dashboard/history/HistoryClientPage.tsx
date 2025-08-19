// app/dashboard/history/HistoryClientPage.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Tipe data untuk work order di halaman riwayat
type WorkOrderHistory = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  wo_number: string | null;
  // PERBAIKAN: Tipe disesuaikan kembali untuk menerima array dari relasi
  equipments: { nama_equipment: string | null }[] | null;
};

type HistoryClientPageProps = {
  initialWorkOrders: WorkOrderHistory[];
};

// Fungsi untuk menentukan warna status
const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
  switch (status) {
    case 'approved':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disetujui</span>;
    case 'rejected':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ditolak</span>;
    case 'pending':
    default:
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
  }
};

export default function HistoryClientPage({ initialWorkOrders }: HistoryClientPageProps) {
  const [workOrders] = useState(initialWorkOrders);

  if (workOrders.length === 0) {
    return <p className="text-center text-gray-500 mt-8">Anda belum pernah membuat work order.</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor WO</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Detail</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workOrders.map((wo) => (
            <tr key={wo.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(wo.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </td>
              {/* PERBAIKAN: Mengakses elemen pertama [0] dari array relasi */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wo.equipments?.[0]?.nama_equipment || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wo.wo_number || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(wo.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {/* <Link href={`/dashboard/detail/${wo.id}`} className="text-indigo-600 hover:text-indigo-900">Lihat</Link> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
