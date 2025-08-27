'use client';

import Link from 'next/link';
import { type WorkOrder } from './AdminTabs';

type WorkOrderListProps = {
  workOrders: WorkOrder[];
  activeTab: 'pending' | 'approved' | 'rejected';
  onDelete: (id: string) => void;
  onEdit: (workOrder: WorkOrder) => void;
};

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-600">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);

export default function WorkOrderList({ workOrders, activeTab, onDelete, onEdit }: WorkOrderListProps) {
  if (workOrders.length === 0) {
    return <p className="text-center text-gray-500">Tidak ada work order yang ditemukan.</p>;
  }

  const headers = ['ID Work Order'];
  if (activeTab === 'approved') headers.push('Nomor WO');
  headers.push('Pemohon', 'Equipment', 'Tanggal Dibuat');
  if (activeTab === 'approved') headers.push('Status');
  headers.push('Aksi');

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workOrders.map((wo) => (
            <tr key={wo.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{wo.id.substring(0, 8)}...</td>
              
              {activeTab === 'approved' && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{wo.wo_number || '-'}</td>
              )}

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wo.profiles?.full_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wo.equipments?.nama_equipment || 'N/A'}</td>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(wo.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
              </td>

              {activeTab === 'approved' && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {wo.status === 'done' ? <CheckCircleIcon /> : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  )}
                </td>
              )}

              <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-4">
                <Link href={`/admin/work-orders/${wo.id}`} className="text-indigo-600 hover:text-indigo-900">Lihat Detail</Link>
                
                {activeTab === 'approved' && (
                  <button onClick={() => onEdit(wo)} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                )}
                
                {/* --- PERBAIKAN DI SINI --- */}
                {/* Tombol Hapus sekarang muncul di semua tab */}
                {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'rejected') && (
                  <button onClick={() => onDelete(wo.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
