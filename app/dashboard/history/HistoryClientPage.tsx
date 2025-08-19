// app/dashboard/history/HistoryClientPage.tsx
'use client';

import { useState } from 'react';
import FormattedDate from './FormattedDate';
// PERBAIKAN 1: Impor tipe data utama dari file page.tsx
import { type WorkOrderHistory } from './page';

// PERBAIKAN 2: Definisikan tipe untuk props komponen ini
type HistoryClientPageProps = {
  initialWorkOrders: WorkOrderHistory[];
};

const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
  switch (status) {
    case 'approved':
      return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Disetujui</span>;
    case 'rejected':
      return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ditolak</span>;
    default:
      return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
  }
};

// Gunakan tipe yang sudah didefinisikan
export default function HistoryClientPage({ initialWorkOrders }: HistoryClientPageProps) {
  const [workOrders] = useState(initialWorkOrders);

  if (workOrders.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Belum Ada Data</h3>
        <p className="text-sm text-gray-500 mt-1">Anda belum pernah membuat work order.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200/75 rounded-xl overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Equipment</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nomor WO</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Karena TypeScript sekarang tahu tipe `workOrders`, maka `wo` juga dikenali */}
          {workOrders.map((wo) => (
            <tr key={wo.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <FormattedDate dateString={wo.created_at} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{wo.equipments?.nama_equipment || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{wo.wo_number || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(wo.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}