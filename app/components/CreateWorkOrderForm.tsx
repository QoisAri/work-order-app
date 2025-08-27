'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';

// Tipe data untuk props
type JobType = { id: string; nama_pekerjaan: string };
type Department = { id: string; nama_departemen: string };
type Equipment = { id: string; nama_equipment: string };
type FormProps = {
  jobTypes: JobType[];
  departments: Department[];
  initialData: Record<string, any>;
};

export default function CreateWorkOrderForm({ jobTypes, departments, initialData }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // State untuk form data
  const [fullName, setFullName] = useState(initialData.full_name || '');
  const [noWa, setNoWa] = useState(initialData.no_wa || '');
  const [subDepart, setSubDepart] = useState(initialData.sub_depart || '');
  
  // State untuk dropdown yang saling berhubungan
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isFetchingEquipments, setIsFetchingEquipments] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');

  // Effect untuk mengambil data equipment berdasarkan jenis pekerjaan
  useEffect(() => {
    if (!selectedJobType) {
      setEquipments([]);
      setSelectedEquipmentId('');
      return;
    }
    const fetchEquipments = async () => {
      setIsFetchingEquipments(true);
      setError(null);
      try {
        const response = await fetch(`/api/equipments?jobTypeId=${selectedJobType}`);
        if (!response.ok) throw new Error('Gagal memuat data equipment.');
        const data = await response.json();
        setEquipments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetchingEquipments(false);
      }
    };
    fetchEquipments();
  }, [selectedJobType]);

  // --- FUNGSI HANDLE SUBMIT ---
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validasi
    if (!selectedJobType || !selectedEquipmentId) {
      setError("Silakan lengkapi Jenis Pekerjaan dan Equipment.");
      return;
    }

    // Kumpulkan semua data untuk dikirim ke API
    const workOrderData = {
        full_name: fullName,
        no_wa: noWa,
        sub_depart: subDepart,
        job_type_id: selectedJobType,
        equipment_id: selectedEquipmentId,
    };

    startTransition(async () => {
        try {
            // Panggil API route untuk MENYIMPAN work order awal
            const response = await fetch('/api/submit-work-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workOrderData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Terjadi kesalahan.');
            }
            
            // --- PERBAIKAN KRITIS DI SINI ---
            // Ambil ID work order yang baru saja dibuat
            const workOrderId = result.data.id;
            
            // Arahkan ke halaman form equipment dengan MEMBAWA ID tersebut
            router.push(`/dashboard/create/${selectedEquipmentId}?workOrderId=${workOrderId}`);

        } catch (err: any) {
            setError(err.message);
        }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Buat Work Order
      </h1>
      
      {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

      {/* Input Nama, WA, Departemen */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input name="full_name" id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="no_wa" className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
        <input name="no_wa" id="no_wa" required value={noWa} onChange={(e) => setNoWa(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="sub_depart" className="block text-sm font-medium text-gray-700">Departemen</label>
        <select name="sub_depart" id="sub_depart" required value={subDepart} onChange={(e) => setSubDepart(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option value="" disabled>Pilih Departemen...</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.nama_departemen}>{dept.nama_departemen}</option>
          ))}
        </select>
      </div>

      {/* Dropdown Jenis Pekerjaan */}
      <div>
        <label htmlFor="job_type_id" className="block text-sm font-medium text-gray-700">Jenis Pekerjaan</label>
        <select 
          name="job_type_id" 
          id="job_type_id" 
          required
          value={selectedJobType}
          onChange={(e) => setSelectedJobType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Pilih Pekerjaan...</option>
          {jobTypes.map(job => (
            <option key={job.id} value={job.id}>{job.nama_pekerjaan}</option>
          ))}
        </select>
      </div>

      {/* Dropdown Equipment */}
      {selectedJobType && (
        <div>
          <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700">Pilih Equipment</label>
          <select 
            name="equipment_id" 
            id="equipment_id" 
            required
            disabled={isFetchingEquipments || equipments.length === 0}
            value={selectedEquipmentId}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">{isFetchingEquipments ? 'Memuat...' : 'Pilih Equipment...'}</option>
            {equipments.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.nama_equipment}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending} 
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {isPending ? 'Memproses...' : 'Lanjutkan'}
      </button>
    </form>
  );
}
