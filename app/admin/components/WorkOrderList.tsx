// app/admin/components/WorkOrderList.tsx
import Link from 'next/link';
import { type WorkOrder } from './AdminTabs';

type WorkOrderListProps = {
  workOrders: WorkOrder[];
  activeTab: 'pending' | 'approved' | 'rejected'; // Tambahkan prop ini
};

export default function WorkOrderList({ workOrders, activeTab }: WorkOrderListProps) {
  if (workOrders.length === 0) {
    return <p className="text-center text-gray-500">Tidak ada work order yang ditemukan.</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Work Order
            </th>
            {/* Tampilkan kolom ini hanya di tab 'approved' */}
            {activeTab === 'approved' && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor WO
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pemohon
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Equipment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal Dibuat
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workOrders.map((wo) => (
            <tr key={wo.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{wo.id.substring(0, 8)}...</td>
              {/* Tampilkan kolom ini hanya di tab 'approved' */}
              {activeTab === 'approved' && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {wo.wo_number || 'N/A'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{wo.profiles?.full_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wo.equipments?.nama_equipment || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(wo.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/admin/work-orders/${wo.id}`} className="text-indigo-600 hover:text-indigo-900">
                  Lihat Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
