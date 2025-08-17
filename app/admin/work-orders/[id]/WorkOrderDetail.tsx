// app/admin/work-orders/[id]/WorkOrderDetail.tsx
'use client';

// Tipe data untuk detail Work Order
type WorkOrderDetails = {
  id: string;
  created_at: string;
  status: string;
  wo_number: string | null;
  details: Record<string, any>;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  equipments: {
    nama_equipment: string | null;
  } | null;
};

type Props = {
  workOrder: WorkOrderDetails;
};

// Fungsi untuk membuat label yang lebih mudah dibaca dari nama field
const formatLabel = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

export default function WorkOrderDetail({ workOrder }: Props) {
  if (!workOrder) {
    return <p>Work Order tidak ditemukan.</p>;
  }

  const renderDetailValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      );
    }
    return value || 'N/A';
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Informasi Umum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Nomor Work Order</p>
            <p className="font-semibold text-lg">{workOrder.wo_number || '(Belum Disetujui)'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-semibold text-lg capitalize ${
              workOrder.status === 'approved' ? 'text-green-600' :
              workOrder.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
            }`}>{workOrder.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pemohon</p>
            <p className="font-semibold">{workOrder.profiles?.full_name || workOrder.profiles?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Equipment</p>
            <p className="font-semibold">{workOrder.equipments?.nama_equipment || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800">Detail Pekerjaan</h2>
        <div className="mt-4 space-y-3">
          {Object.entries(workOrder.details).map(([key, value]) => {
            if (key === 'equipmentId') return null; // Sembunyikan equipmentId
            return (
              <div key={key} className="grid grid-cols-3 gap-4 border-b py-2">
                <p className="text-sm font-medium text-gray-600 col-span-1">{formatLabel(key)}</p>
                <div className="text-sm text-gray-800 col-span-2">{renderDetailValue(value)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
