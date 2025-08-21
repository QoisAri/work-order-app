// app/admin/work-orders/[id]/WorkOrderDetail.tsx
import DownloadButton from './DownloadButton'; // <-- PASTIKAN TOMBOL DI-IMPOR

// Komponen kecil untuk menampilkan baris detail
const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
    <dt className="text-sm font-medium leading-6 text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm leading-6 text-gray-800 font-semibold sm:col-span-2 sm:mt-0">{value || '-'}</dd>
  </div>
);

export default function WorkOrderDetail({ workOrder }: { workOrder: any }) {
  const details = workOrder.details || {};

  // Kamus label untuk detail pekerjaan
  const detailLabels: { [key: string]: string } = {
    jenis_equipment: 'Jenis equipment',
    estimasi_selesai: 'Estimasi selesai',
    lokasi_equipment: 'Lokasi equipment',
    deskripsi_pekerjaan: 'Deskripsi pekerjaan',
    estimasi_pengerjaan: 'Estimasi pengerjaan',
    // Tambahkan label lain dari semua form Anda di sini
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4">
      {/* BAGIAN HEADER DETAIL */}
      <div className="px-4 sm:px-0 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold leading-7 text-gray-900">Informasi Umum</h3>
        </div>
        {/* PERBAIKAN: Tombol Unduh dipanggil dan ditampilkan di sini */}
        <DownloadButton workOrder={workOrder} />
      </div>

      {/* INFORMASI UMUM */}
      <div className="mt-6 border-t border-gray-200">
        <dl className="divide-y divide-gray-200">
          <DetailRow label="Nomor Work Order" value={workOrder.wo_number} />
          <DetailRow label="Pemohon" value={workOrder.profiles?.full_name} />
          <DetailRow label="Status" value={
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                workOrder.status === 'approved' ? 'bg-green-100 text-green-800' :
                workOrder.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
            }`}>
              {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
            </span>
          } />
          <DetailRow label="Equipment" value={workOrder.equipments?.nama_equipment} />
        </dl>
      </div>
      
      {/* DETAIL PEKERJAAN */}
      <div className="px-4 sm:px-0 mt-8">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Detail Pekerjaan</h3>
      </div>
      <div className="mt-6 border-t border-gray-200">
        <dl className="divide-y divide-gray-200">
          {Object.keys(details).map(key => {
            if (detailLabels[key]) {
              const value = Array.isArray(details[key]) ? details[key].join(', ') : details[key];
              return <DetailRow key={key} label={detailLabels[key]} value={value} />;
            }
            return null;
          })}
        </dl>
      </div>
    </div>
  );
}